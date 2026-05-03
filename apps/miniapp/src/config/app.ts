export const rootTabs = [
  { key: 'home', label: '首页', icon: '⌂', path: '/pages/home/index' },
  { key: 'feeding', label: '辅食', icon: '☰', path: '/pages/feeding/index' },
  { key: 'vaccine', label: '疫苗', icon: '💉', path: '/pages/vaccine/index' },
  { key: 'knowledge', label: '干货', icon: '◎', path: '/pages/knowledge/index' },
  { key: 'profile', label: '我的', icon: '☺', path: '/pages/profile/index' }
] as const

export type RootTabKey = (typeof rootTabs)[number]['key']

export const appConfig = {
  appName: '养娃小管家',
  miniProgramAppId: 'wx22461febd3e9ad52',
  shareSlogan: '科学辅食，悦享成长',
  //apiBaseUrl: 'http://localhost:3000/api',
  apiBaseUrl: 'https://madaicode.cn/api',
  note: '微信 secret 仅允许在后端配置，禁止写入前端。'
}
