import app from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.log(`baby-food-api listening on http://localhost:${env.port}`)
})
