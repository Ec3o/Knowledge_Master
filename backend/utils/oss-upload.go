package utils

import (
	"fmt"
	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"mime"
	"mime/multipart"
	"net/http"
	"strings"
	"time"
)

type OSSConfig struct {
	Endpoint        string
	AccessKeyID     string
	AccessKeySecret string
	BucketName      string
	BaseURL         string
}

var (
	ossClient *oss.Client
	ossBucket *oss.Bucket
	ossConfig OSSConfig
)

// 初始化OSS客户端
func initOSS() error {
	var err error

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	err = viper.ReadInConfig()
	if err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	// 从配置文件加载OSS配置
	ossConfig = OSSConfig{
		Endpoint:        viper.GetString("oss.endpoint"),
		AccessKeyID:     viper.GetString("oss.access_key_id"),
		AccessKeySecret: viper.GetString("oss.access_key_secret"),
		BucketName:      viper.GetString("oss.bucket_name"),
		BaseURL:         viper.GetString("oss.base_url"),
	}

	// 验证配置是否完整
	if ossConfig.Endpoint == "" || ossConfig.AccessKeyID == "" ||
		ossConfig.AccessKeySecret == "" || ossConfig.BucketName == "" {
		return fmt.Errorf("OSS配置不完整，请检查配置文件")
	}

	// 初始化OSS客户端
	ossClient, err = oss.New(ossConfig.Endpoint, ossConfig.AccessKeyID, ossConfig.AccessKeySecret)
	if err != nil {
		return fmt.Errorf("初始化OSS客户端失败: %v", err)
	}

	ossBucket, err = ossClient.Bucket(ossConfig.BucketName)
	if err != nil {
		return fmt.Errorf("获取Bucket失败: %v", err)
	}

	return nil
}

// UploadAvatarToOSS 上传头像到OSS并返回URL
func UploadAvatarToOSS(fileHeader *multipart.FileHeader) (string, error) {
	if err := initOSS(); err != nil {
		return "", err
	}
	// 1. 打开文件
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("打开文件失败: %v", err)
	}
	defer file.Close()

	// 2. 验证文件类型
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "", fmt.Errorf("读取文件失败: %v", err)
	}
	file.Seek(0, 0) // 重置文件指针

	fileType := http.DetectContentType(buffer)
	ext := ""
	switch fileType {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	case "image/gif":
		ext = ".gif"
	default:
		return "", fmt.Errorf("不支持的文件类型: %s", fileType)
	}

	// 3. 生成唯一文件名
	filename := fmt.Sprintf("avatar/%d%s", time.Now().UnixNano(), ext)
	contentType := mime.TypeByExtension(ext)

	// 4. 上传到OSS
	err = ossBucket.PutObject(
		filename,
		file,
		oss.ContentType(contentType),
		oss.ContentLength(fileHeader.Size),
	)
	if err != nil {
		return "", fmt.Errorf("上传到OSS失败: %v", err)
	}

	// 5. 返回可访问的URL
	url := fmt.Sprintf("%s/%s", strings.TrimRight(ossConfig.BaseURL, "/"), filename)
	return url, nil
}

// 示例Gin路由处理函数
func uploadAvatarHandler(c *gin.Context) {
	// 1. 获取上传文件
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择要上传的文件"})
		return
	}

	// 2. 上传到OSS
	avatarURL, err := UploadAvatarToOSS(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. 返回结果
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"url":     avatarURL,
	})
}
