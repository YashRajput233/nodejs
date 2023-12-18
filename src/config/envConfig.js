import * as dotenv from 'dotenv'

dotenv.config();

const envConfig={
    EMAIL_PASS:process.env.appPassword,
    SECREAT_KEY:process.env.secreatKey,
    DB_URL:process.env.dburl,
    EMAIL_USER:process.env.emailUser,
    EMAIL_HOST:process.env.emailHost,
    EMAIL_PORT:process.env.emailPort,
}
export default envConfig;