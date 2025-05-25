const week = {
  root: {
    title: 'Week',
    children: [
      {
        title: 'Monday',
      },
      {
        title: 'Tuesday',
      },
      {
        title: 'Wednesday',
      },
      {
        title: 'Thursday',
      },
      {
        title: 'Friday',
      },
      {
        title: 'Saturday',
      },
      {
        title: 'Sunday',
      },
    ],
  },
}

const webapp = {
  root: {
    title: 'Building a Web Application',
    children: [
      {
        title: 'TypeScript',
        children: [
          {
            title: 'A typed superset of JavaScript',
          },
          {
            title: 'Open source',
          },
          {
            title: 'Any browser. Any host. Any OS.',
          },
        ],
      },
      {
        title: 'React',
        children: [
          {
            title: 'Declarative',
          },
          {
            title: 'Component-Based',
          },
          {
            title: 'Learn Once, Write Anywhere.',
          },
        ],
      },
      {
        title: 'VS Code',
        children: [
          {
            title: 'Free',
          },
          {
            title: 'Open source',
          },
          {
            title: 'Runs everywhere',
          },
        ],
      },
      {
        title: 'Others',
        children: [
          {
            title: 'Webpack',
          },
          {
            title: 'Babel',
          },
          {
            title: 'ESLint',
          },
        ],
      },
    ],
  },
}

const food = {
  root: {
    title: 'Foods',
    children: [
      {
        title: 'East Asian Cuisine',
        children: [
          {
            title: 'Chinese Cuisine',
            children: [
              {
                title: '徽菜',
              },
              {
                title: '粤菜',
              },
              {
                title: '闽菜',
              },
              {
                title: '湘菜',
              },
              {
                title: '苏菜',
              },
              {
                title: '鲁菜',
              },
              {
                title: '川菜',
              },
              {
                title: '浙菜',
              },
            ],
          },
          {
            title: 'Japanese Cuisine',
          },
          {
            title: 'Korean Cuisine',
          },
        ],
      },
      {
        title: 'West Asian Cuisine',
        children: [
          {
            title: 'Arab Cuisine of the Persian Gulf',
          },
          {
            title: 'Assyrian Cuisine',
          },
          {
            title: 'Bahraini Cuisine',
          },
          {
            title: 'Cypriot Cuisine',
          },
          {
            title: 'Emirati Cuisine',
          },
          {
            title: 'Iranian Cuisine',
          },
          {
            title: 'Iraqi Cuisine',
          },
          {
            title: 'Kuwaiti Cuisine',
          },
          {
            title: 'Omani Cuisine ',
          },
          {
            title: 'Qatari Cuisine',
          },
          {
            title: 'Saudi Arabian Cuisine',
          },
          {
            title: 'Turkish Cuisine',
          },
          {
            title: 'Yemeni Cuisine',
          },
          {
            title: 'Levantine Cuisine',
          },
        ],
      },
      {
        title: 'Southeast Asian Cuisine',
        children: [
          {
            title: 'Bruneian Cuisine',
          },
          {
            title: 'Burmese Cuisine',
          },
          {
            title: 'Cambodian Cuisine',
          },
          {
            title: 'Cuisine of East Timor',
          },
          {
            title: 'Filipino Cuisine',
          },
          {
            title: 'Indonesian Cuisine',
          },
          {
            title: 'Laotian Cuisine',
          },
          {
            title: 'Malaysian Cuisine',
          },
          {
            title: 'Singaporean Cuisine',
          },
          {
            title: 'Thai Cuisine',
          },
          {
            title: 'Vietnamese Cuisine',
          },
        ],
      },
      {
        title: 'South Asian Cuisine',
        children: [
          {
            title: 'Afghan Cuisine',
          },
          {
            title: 'Bangladeshi Cuisine',
          },
          {
            title: 'Bhutanese Cuisine',
          },
          {
            title: 'Indian Cuisine',
          },
          {
            title: 'Maldivian Cuisine',
          },
          {
            title: 'Nepalese Cuisine',
          },
          {
            title: 'Pakistani Cuisine',
          },
          {
            title: 'Sri Lankan Cuisine',
          },
        ],
      },
    ],
  },
}

const thanks = {
  root: {
    title: '谢谢大家',
  },
}

const example = {
  "root": {
      "title": "编译原理",
      "children": [
          {
              "title": "编译器概述"
          },
          {
              "title": "形式文法和形式语言"
          },
          {
              "title": "词法分析",
              "children": [
                  {
                      "title": "测试"
                  },
                  {
                      "title": "不知道是个啥"
                  }
              ]
          },
          {
              "title": "语法分析",
              "children": [
                  {
                      "title": "自底向上分析",
                      "children": [
                          {
                              "title": "新节点"
                          },
                          {
                              "title": "移进-规约法"
                          },
                          {
                              "title": "构造LR分析表"
                          },
                          {
                              "title": "拓广文法"
                          },
                          {
                              "title": "LR(0)项目"
                          },
                          {
                              "title": "LR(0)项目集族算法"
                          },
                          {
                              "title": "构造SLR分析表"
                          }
                      ]
                  },
                  {
                      "title": "自顶向下分析",
                      "children": [
                          {
                              "title": "Follow集"
                          },
                          {
                              "title": "构造预测分析表"
                          },
                          {
                              "title": "LL(1)文法"
                          },
                          {
                              "title": "Select集"
                          },
                          {
                              "title": "First集"
                          },
                          {
                              "title": "非LL(1)到LL(1)文法的等价变换"
                          }
                      ]
                  }
              ]
          },
          {
              "title": "语法翻译制导技术"
          },
          {
              "title": "语义分析与中间代码生成"
          },
          {
              "title": "代码优化",
              "children": [
                  {
                      "title": "测试"
                  }
              ]
          },
          {
              "title": "目标代码运行时刻环境的组织"
          },
          {
              "title": "目标代码生成"
          },
          {
              "title": "编译技术应用"
          }
      ]
  }
}


const presetData = [
  webapp,
  week,
  food,
  thanks,
  example
].map(data => JSON.stringify(data, null, '  '))

export default presetData
