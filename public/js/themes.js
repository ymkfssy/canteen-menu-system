// 四季主题配置
const THEMES = {
  spring: {
    name: '春季',
    colors: {
      primary: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      header: 'linear-gradient(135deg, rgba(168, 237, 234, 0.3) 0%, rgba(254, 214, 227, 0.3) 100%)',
      titleGradient: 'linear-gradient(to right, #ff9a9e, #fecfef, #ff9a9e)',
      titleShadow: 'rgba(255, 154, 158, 0.8)',
      coldDishes: {
        header: '#48dbfb',
        item: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)'
      },
      hotDishes: {
        header: '#f093fb',
        item: 'linear-gradient(135deg, #ffe0ec 0%, #ffc2d4 100%)'
      },
      stapleFood: {
        header: '#a8e063',
        item: 'linear-gradient(135deg, #f0f9e8 0%, #d4edbd 100%)'
      },
      soup: {
        header: '#7ee8fa',
        item: 'linear-gradient(135deg, #e8f8f5 0%, #d0ece7 100%)'
      },
      fruit: {
        header: '#ff9a9e',
        item: 'linear-gradient(135deg, #ffe8ea 0%, #ffd4d7 100%)'
      }
    }
  },
  summer: {
    name: '夏季',
    colors: {
      primary: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      header: 'linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%)',
      titleGradient: 'linear-gradient(to right, #00f2fe, #4facfe, #00f2fe)',
      titleShadow: 'rgba(0, 242, 254, 0.8)',
      coldDishes: {
        header: '#00d2ff',
        item: 'linear-gradient(135deg, #dff6ff 0%, #b3e5fc 100%)'
      },
      hotDishes: {
        header: '#ff6b6b',
        item: 'linear-gradient(135deg, #ffe5e5 0%, #ffcccc 100%)'
      },
      stapleFood: {
        header: '#feca57',
        item: 'linear-gradient(135deg, #fff4d9 0%, #ffe4a3 100%)'
      },
      soup: {
        header: '#48dbfb',
        item: 'linear-gradient(135deg, #e1f5fe 0%, #b3e0f2 100%)'
      },
      fruit: {
        header: '#ff9ff3',
        item: 'linear-gradient(135deg, #ffe9fc 0%, #ffd4f7 100%)'
      }
    }
  },
  autumn: {
    name: '秋季',
    colors: {
      primary: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
      header: 'linear-gradient(135deg, rgba(250, 140, 22, 0.3) 0%, rgba(250, 173, 20, 0.3) 100%)',
      titleGradient: 'linear-gradient(to right, #ffd89b, #ff9a56, #ffd89b)',
      titleShadow: 'rgba(255, 154, 86, 0.8)',
      coldDishes: {
        header: '#ff9f43',
        item: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
      },
      hotDishes: {
        header: '#ee5a24',
        item: 'linear-gradient(135deg, #ffe6db 0%, #ffcab8 100%)'
      },
      stapleFood: {
        header: '#f39c12',
        item: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)'
      },
      soup: {
        header: '#d35400',
        item: 'linear-gradient(135deg, #ffeee6 0%, #ffd9c7 100%)'
      },
      fruit: {
        header: '#e67e22',
        item: 'linear-gradient(135deg, #ffe9db 0%, #ffd4b8 100%)'
      }
    }
  },
  winter: {
    name: '冬季',
    colors: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      header: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
      titleGradient: 'linear-gradient(to right, #e0e7ff, #c7d2fe, #e0e7ff)',
      titleShadow: 'rgba(199, 210, 254, 0.8)',
      coldDishes: {
        header: '#5f27cd',
        item: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)'
      },
      hotDishes: {
        header: '#ee5a6f',
        item: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)'
      },
      stapleFood: {
        header: '#8e44ad',
        item: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
      },
      soup: {
        header: '#3742fa',
        item: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)'
      },
      fruit: {
        header: '#5f27cd',
        item: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)'
      }
    }
  },
  prosperity: {
    name: '开门红',
    colors: {
      primary: 'linear-gradient(135deg, #ff4757 0%, #ff6348 20%, #ffa502 50%, #ff4757 80%, #c44569 100%)',
      header: 'linear-gradient(135deg, rgba(255, 71, 87, 0.9) 0%, rgba(255, 165, 2, 0.8) 50%, rgba(196, 69, 105, 0.9) 100%)',
      titleGradient: 'linear-gradient(to right, #ffd700, #ff4757, #ffd700, #ff6348, #ffd700)',
      titleShadow: 'rgba(255, 71, 87, 0.9)',
      coldDishes: {
        header: '#ff4757',
        item: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 50%, #ffd3d3 100%)'
      },
      hotDishes: {
        header: '#ff6348',
        item: 'linear-gradient(135deg, #fff9f0 0%, #ffe8d6 50%, #ffd4b3 100%)'
      },
      stapleFood: {
        header: '#ffa502',
        item: 'linear-gradient(135deg, #fffbf0 0%, #fff9e6 50%, #fff4cc 100%)'
      },
      soup: {
        header: '#ff7675',
        item: 'linear-gradient(135deg, #fff5f7 0%, #ffe8ec 50%, #ffd6d9 100%)'
      },
      fruit: {
        header: '#fd79a8',
        item: 'linear-gradient(135deg, #fff0f5 0%, #ffe8f1 50%, #ffd1dc 100%)'
      }
    },
    isProsperityTheme: true
  }
};

// 导出主题配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THEMES;
}
