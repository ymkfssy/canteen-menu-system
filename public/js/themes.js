// 四季主题配置 - Modern Glassmorphism (现代玻璃拟态)
const THEMES = {
  spring: {
    name: '春季',
    colors: {
      primary: 'linear-gradient(135deg, #E8F5E9 0%, #FCE4EC 100%)',
      header: 'rgba(232, 245, 233, 0.85)',
      titleGradient: 'linear-gradient(to right, #81C784, #F06292, #81C784)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#81C784',
        item: 'rgba(129, 199, 132, 0.12)'
      },
      hotDishes: {
        header: '#FF8A65',
        item: 'rgba(255, 138, 101, 0.12)'
      },
      stapleFood: {
        header: '#FFD54F',
        item: 'rgba(255, 213, 79, 0.12)'
      },
      soup: {
        header: '#4DD0E1',
        item: 'rgba(77, 208, 225, 0.12)'
      },
      fruit: {
        header: '#F06292',
        item: 'rgba(240, 98, 146, 0.12)'
      }
    }
  },
  summer: {
    name: '夏季',
    colors: {
      primary: 'linear-gradient(135deg, #E3F2FD 0%, #FFF3E0 100%)',
      header: 'rgba(227, 242, 253, 0.85)',
      titleGradient: 'linear-gradient(to right, #4FC3F7, #FF7043, #4FC3F7)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#4FC3F7',
        item: 'rgba(79, 195, 247, 0.12)'
      },
      hotDishes: {
        header: '#FF7043',
        item: 'rgba(255, 112, 67, 0.12)'
      },
      stapleFood: {
        header: '#FFCA28',
        item: 'rgba(255, 202, 40, 0.12)'
      },
      soup: {
        header: '#26C6DA',
        item: 'rgba(38, 198, 218, 0.12)'
      },
      fruit: {
        header: '#EC407A',
        item: 'rgba(236, 64, 122, 0.12)'
      }
    }
  },
  autumn: {
    name: '秋季',
    colors: {
      primary: 'linear-gradient(135deg, #FFF8E1 0%, #FBE9E7 100%)',
      header: 'rgba(255, 248, 225, 0.85)',
      titleGradient: 'linear-gradient(to right, #FFB74D, #E64A19, #FFB74D)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#FFB74D',
        item: 'rgba(255, 183, 77, 0.12)'
      },
      hotDishes: {
        header: '#E64A19',
        item: 'rgba(230, 74, 25, 0.12)'
      },
      stapleFood: {
        header: '#FFA726',
        item: 'rgba(255, 167, 38, 0.12)'
      },
      soup: {
        header: '#8D6E63',
        item: 'rgba(141, 110, 99, 0.12)'
      },
      fruit: {
        header: '#AB47BC',
        item: 'rgba(171, 71, 188, 0.12)'
      }
    }
  },
  winter: {
    name: '冬季',
    colors: {
      primary: 'linear-gradient(135deg, #EDE7F6 0%, #E0F2F1 100%)',
      header: 'rgba(237, 231, 246, 0.85)',
      titleGradient: 'linear-gradient(to right, #7986CB, #4DB6AC, #7986CB)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#7986CB',
        item: 'rgba(121, 134, 203, 0.12)'
      },
      hotDishes: {
        header: '#EF5350',
        item: 'rgba(239, 83, 80, 0.12)'
      },
      stapleFood: {
        header: '#78909C',
        item: 'rgba(120, 144, 156, 0.12)'
      },
      soup: {
        header: '#4DB6AC',
        item: 'rgba(77, 182, 172, 0.12)'
      },
      fruit: {
        header: '#CE93D8',
        item: 'rgba(206, 147, 216, 0.12)'
      }
    }
  },
  prosperity: {
    name: '开门红',
    colors: {
      primary: 'linear-gradient(135deg, #FFF5F5 0%, #FFF8E1 100%)',
      header: 'rgba(255, 245, 245, 0.90)',
      titleGradient: 'linear-gradient(to right, #EF5350, #FFD54F, #EF5350)',
      titleShadow: 'rgba(0, 0, 0, 0.25)',
      coldDishes: {
        header: '#EF5350',
        item: 'rgba(239, 83, 80, 0.12)'
      },
      hotDishes: {
        header: '#E53935',
        item: 'rgba(229, 57, 53, 0.12)'
      },
      stapleFood: {
        header: '#FB8C00',
        item: 'rgba(251, 140, 0, 0.12)'
      },
      soup: {
        header: '#E57373',
        item: 'rgba(229, 115, 115, 0.12)'
      },
      fruit: {
        header: '#F06292',
        item: 'rgba(240, 98, 146, 0.12)'
      }
    },
    isProsperityTheme: true
  }
};

// 导出主题配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THEMES;
}
