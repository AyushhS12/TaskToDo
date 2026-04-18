import { Pool, PoolConfig } from "pg";

// export default new Pool({
//     user:"root",
//     host:"localhost",
//     password:"1234",
//     database:"todo",
//     port:5432
// })

export default new Pool({
    connectionString:process.env.DATABASE_URL
})