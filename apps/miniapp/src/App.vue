<script lang="ts">
import { syncAppSession } from '@/services/api'

const SYNC_THROTTLE_MS = 5 * 60 * 1000
let lastSyncAt = 0

export default {
  onLaunch() {
    lastSyncAt = Date.now()
    void syncAppSession()
  },
  onShow() {
    if (Date.now() - lastSyncAt < SYNC_THROTTLE_MS) return
    lastSyncAt = Date.now()
    void syncAppSession()
  },
  onHide() {}
}
</script>

<style lang="scss">
@import './styles/tokens.scss';

page {
  background: var(--mini-bg);
  color: var(--mini-text);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
