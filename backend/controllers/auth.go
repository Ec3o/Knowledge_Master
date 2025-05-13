package controllers

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"knowledge_master_backend/utils"
	"net/http"
	"time"
)

// 统一响应结构
type apiResponse struct {
	Status  string      `json:"status"`  // "success" 或 "failed"
	Message string      `json:"message"` // 简要操作信息
	Data    interface{} `json:"data"`    // 返回的具体数据
}

func SetupCORS(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
}

func Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Username string `json:"username" binding:"required"`
	}

	// 参数绑定校验
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, apiResponse{
			Status:  "failed",
			Message: "无效的请求凭证",
			Data:    gin.H{"details": err.Error()},
		})
		return
	}

	// 密码加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "无法处理密码",
			Data:    nil,
		})
		return
	}

	// 创建用户
	user, err := models.CreateUser(config.DB, input.Email, string(hashedPassword), input.Username)
	if err != nil {
		c.JSON(http.StatusConflict, apiResponse{
			Status:  "failed",
			Message: "邮箱已经被注册",
			Data:    nil,
		})
		return
	}
	err = models.CreateUserProfile(config.DB, user.UserID, user.Username, user.Email, "是否尝试留下些什么...", "http://example.com", "https://avatar.iran.liara.run/public")
	if err != nil {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "无法创建用户资料",
			Data:    nil,
		})
		return
	}
	user.Password = "******"
	c.JSON(http.StatusCreated, apiResponse{
		Status:  "success",
		Message: "用户注册成功",
		Data: gin.H{
			"user": user,
		},
	})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	// 参数校验
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, apiResponse{
			Status:  "failed",
			Message: "无效的用户名密码",
			Data:    gin.H{"details": err.Error()},
		})
		return
	}

	// 查询用户
	user, err := models.GetUserByEmail(config.DB, input.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, apiResponse{
			Status:  "failed",
			Message: "鉴权失败",
			Data:    gin.H{"hint": "Check your email and password"},
		})
		return
	}

	// 密码验证
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, apiResponse{
			Status:  "failed",
			Message: "鉴权失败",
			Data:    gin.H{"hint": "Check your email and password"},
		})
		return
	}

	// 生成Token
	token, err := utils.GenerateToken(user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "无法生成访问凭证，请检查后端服务器运行情况",
			Data:    nil,
		})
		return
	}

	user.Password = "******"
	c.JSON(http.StatusOK, apiResponse{
		Status:  "success",
		Message: "登录成功",
		Data: gin.H{
			"token": token,
			"user":  user,
		},
	})
}
