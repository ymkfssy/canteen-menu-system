// 四季主题配置 - Vivid & Bold (鲜明大胆)
const THEMES = {
  spring: {
    name: '春季',
    colors: {
      primary: 'linear-gradient(135deg, #1B5E20 0%, #4A148C 100%)',
      header: 'rgba(27, 94, 32, 0.88)',
      titleGradient: 'linear-gradient(to right, #66BB6A, #E91E63, #66BB6A)',
      titleShadow: 'rgba(0, 0, 0, 0.6)',
      coldDishes: {
        header: '#66BB6A',
        item: 'rgba(102, 187, 106, 0.15)'
      },
      hotDishes: {
        header: '#FF7043',
        item: 'rgba(255, 112, 67, 0.15)'
      },
      stapleFood: {
        header: '#FFCA28',
        item: 'rgba(255, 202, 40, 0.15)'
      },
      soup: {
        header: '#26C6DA',
        item: 'rgba(38, 198, 218, 0.15)'
      },
      fruit: {
        header: '#EC407A',
        item: 'rgba(236, 64, 122, 0.15)'
      }
    }
  },
  summer: {
    name: '夏季',
    colors: {
      primary: 'linear-gradient(135deg, #0D47A1 0%, #006064 100%)',
      header: 'rgba(13, 71, 161, 0.88)',
      titleGradient: 'linear-gradient(to right, #42A5F5, #FF6F00, #42A5F5)',
      titleShadow: 'rgba(0, 0, 0, 0.6)',
      coldDishes: {
        header: '#42A5F5',
        item: 'rgba(66, 165, 245, 0.15)'
      },
      hotDishes: {
        header: '#EF5350',
        item: 'rgba(239, 83, 80, 0.15)'
      },
      stapleFood: {
        header: '#FFA726',
        item: 'rgba(255, 167, 38, 0.15)'
      },
      soup: {
        header: '#26A69A',
        item: 'rgba(38, 166, 154, 0.15)'
      },
      fruit: {
        header: '#AB47BC',
        item: 'rgba(171, 71, 188, 0.15)'
      }
    }
  },
  autumn: {
    name: '秋季',
    colors: {
      primary: 'linear-gradient(135deg, #3E2723 0%, #E65100 100%)',
      header: 'rgba(62, 39, 35, 0.88)',
      titleGradient: 'linear-gradient(to right, #FF8A65, #FFB300, #FF8A65)',
      titleShadow: 'rgba(0, 0, 0, 0.6)',
      coldDishes: {
        header: '#A1887F',
        item: 'rgba(161, 136, 127, 0.15)'
      },
      hotDishes: {
        header: '#D84315',
        item: 'rgba(216, 67, 21, 0.15)'
      },
      stapleFood: {
        header: '#FFB300',
        item: 'rgba(255, 179, 0, 0.15)'
      },
      soup: {
        header: '#78909C',
        item: 'rgba(120, 144, 156, 0.15)'
      },
      fruit: {
        header: '#8D6E63',
        item: 'rgba(141, 110, 99, 0.15)'
      }
    }
  },
  winter: {
    name: '冬季',
    colors: {
      primary: 'linear-gradient(135deg, #1A237E 0%, #004D40 100%)',
      header: 'rgba(26, 35, 126, 0.88)',
      titleGradient: 'linear-gradient(to right, #5C6BC0, #00BCD4, #5C6BC0)',
      titleShadow: 'rgba(0, 0, 0, 0.6)',
      coldDishes: {
        header: '#5C6BC0',
        item: 'rgba(92, 107, 192, 0.15)'
      },
      hotDishes: {
        header: '#E53935',
        item: 'rgba(229, 57, 53, 0.15)'
      },
      stapleFood: {
        header: '#546E7A',
        item: 'rgba(84, 110, 122, 0.15)'
      },
      soup: {
        header: '#00897B',
        item: 'rgba(0, 137, 123, 0.15)'
      },
      fruit: {
        header: '#7E57C2',
        item: 'rgba(126, 87, 194, 0.15)'
      }
    }
  },
  prosperity: {
    name: '开门红',
    colors: {
      primary: 'linear-gradient(135deg, #4A0000 0%, #E65100 100%)',
      header: 'rgba(74, 0, 0, 0.90)',
      titleGradient: 'linear-gradient(to right, #E53935, #FFD600, #E53935)',
      titleShadow: 'rgba(0, 0, 0, 0.6)',
      coldDishes: {
        header: '#E53935',
        item: 'rgba(229, 57, 53, 0.15)'
      },
      hotDishes: {
        header: '#C62828',
        item: 'rgba(198, 40, 40, 0.15)'
      },
      stapleFood: {
        header: '#F57C00',
        item: 'rgba(245, 124, 0, 0.15)'
      },
      soup: {
        header: '#EF5350',
        item: 'rgba(239, 83, 80, 0.15)'
      },
      fruit: {
        header: '#D81B60',
        item: 'rgba(216, 27, 96, 0.15)'
      }
    },
    isProsperityTheme: true
  }
};

// 导出主题配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THEMES;
}
