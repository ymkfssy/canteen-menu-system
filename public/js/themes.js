// 四季主题配置 - Nature-Inspired Harmony (自然和谐)
const THEMES = {
  spring: {
    name: '春季',
    colors: {
      primary: 'linear-gradient(135deg, #F5F0E8 0%, #E8E0D0 100%)',
      header: 'rgba(245, 240, 232, 0.85)',
      titleGradient: 'linear-gradient(to right, #A5D6A7, #F48FB1, #A5D6A7)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#A5D6A7',
        item: 'rgba(165, 214, 167, 0.12)'
      },
      hotDishes: {
        header: '#EF9A9A',
        item: 'rgba(239, 154, 154, 0.12)'
      },
      stapleFood: {
        header: '#FFF59D',
        item: 'rgba(255, 245, 157, 0.12)'
      },
      soup: {
        header: '#80CBC4',
        item: 'rgba(128, 203, 196, 0.12)'
      },
      fruit: {
        header: '#F48FB1',
        item: 'rgba(244, 143, 177, 0.12)'
      }
    }
  },
  summer: {
    name: '夏季',
    colors: {
      primary: 'linear-gradient(135deg, #E8EDF2 0%, #F0E8D8 100%)',
      header: 'rgba(232, 237, 242, 0.85)',
      titleGradient: 'linear-gradient(to right, #90CAF9, #FFAB91, #90CAF9)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#90CAF9',
        item: 'rgba(144, 202, 249, 0.12)'
      },
      hotDishes: {
        header: '#FFAB91',
        item: 'rgba(255, 171, 145, 0.12)'
      },
      stapleFood: {
        header: '#FFE082',
        item: 'rgba(255, 224, 130, 0.12)'
      },
      soup: {
        header: '#80DEEA',
        item: 'rgba(128, 222, 234, 0.12)'
      },
      fruit: {
        header: '#CE93D8',
        item: 'rgba(206, 147, 216, 0.12)'
      }
    }
  },
  autumn: {
    name: '秋季',
    colors: {
      primary: 'linear-gradient(135deg, #F5EDE0 0%, #F0E0D0 100%)',
      header: 'rgba(245, 237, 224, 0.85)',
      titleGradient: 'linear-gradient(to right, #FFCC80, #BCAAA4, #FFCC80)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#FFCC80',
        item: 'rgba(255, 204, 128, 0.12)'
      },
      hotDishes: {
        header: '#BCAAA4',
        item: 'rgba(188, 170, 164, 0.12)'
      },
      stapleFood: {
        header: '#E6C280',
        item: 'rgba(230, 194, 128, 0.12)'
      },
      soup: {
        header: '#A1887F',
        item: 'rgba(161, 136, 127, 0.12)'
      },
      fruit: {
        header: '#B39DDB',
        item: 'rgba(179, 157, 219, 0.12)'
      }
    }
  },
  winter: {
    name: '冬季',
    colors: {
      primary: 'linear-gradient(135deg, #E8ECF0 0%, #DCE0E8 100%)',
      header: 'rgba(232, 236, 240, 0.85)',
      titleGradient: 'linear-gradient(to right, #9FA8DA, #80CBC4, #9FA8DA)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#9FA8DA',
        item: 'rgba(159, 168, 218, 0.12)'
      },
      hotDishes: {
        header: '#EF9A9A',
        item: 'rgba(239, 154, 154, 0.12)'
      },
      stapleFood: {
        header: '#90A4AE',
        item: 'rgba(144, 164, 174, 0.12)'
      },
      soup: {
        header: '#80CBC4',
        item: 'rgba(128, 203, 196, 0.12)'
      },
      fruit: {
        header: '#B39DDB',
        item: 'rgba(179, 157, 219, 0.12)'
      }
    }
  },
  prosperity: {
    name: '开门红',
    colors: {
      primary: 'linear-gradient(135deg, #F5E8E0 0%, #EDE0D0 100%)',
      header: 'rgba(245, 232, 224, 0.88)',
      titleGradient: 'linear-gradient(to right, #E57373, #FFD54F, #E57373)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#EF9A9A',
        item: 'rgba(239, 154, 154, 0.12)'
      },
      hotDishes: {
        header: '#E57373',
        item: 'rgba(229, 115, 115, 0.12)'
      },
      stapleFood: {
        header: '#FFD54F',
        item: 'rgba(255, 213, 79, 0.12)'
      },
      soup: {
        header: '#FFAB91',
        item: 'rgba(255, 171, 145, 0.12)'
      },
      fruit: {
        header: '#F48FB1',
        item: 'rgba(244, 143, 177, 0.12)'
      }
    },
    isProsperityTheme: true
  }
};

// 导出主题配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THEMES;
}
