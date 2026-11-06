import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(env.port, () => {
  console.log(`RAWR server listening on port ${env.port}`)
})
