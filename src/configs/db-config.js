// Configuración de conexión a PostgreSQL.
//
// Las credenciales se leen desde el archivo .env (que `server.js` carga al
// arrancar con `import 'dotenv/config'`), así NO quedan escritas en el código.
//
// 👉 Para cambiar de base, editá UNA sola línea en el .env:
//        DB_TARGET = "local"      → PostgreSQL en tu máquina
//        DB_TARGET = "supabase"   → PostgreSQL en la nube (Supabase)
//
// Según ese valor tomamos el juego de variables que corresponda:
// las DB_LOCAL_* o las DB_SUPABASE_*.
const target = (process.env.DB_TARGET ?? 'local').trim().toLowerCase();
const prefix = target === 'supabase' ? 'DB_SUPABASE_' : 'DB_LOCAL_';

const DBConfig = {
    host     : process.env[prefix + 'HOST']     ?? 'localhost',
    database : process.env[prefix + 'DATABASE'] ?? '',
    user     : process.env[prefix + 'USER']     ?? '',
    password : process.env[prefix + 'PASSWORD'] ?? '',
    port     : process.env[prefix + 'PORT']     ?? 5432,
    // Supabase (y casi todas las bases en la nube) exigen SSL; la local no.
    ssl      : target === 'supabase' ? { rejectUnauthorized: false } : false
    //max                     : 20,       //maximum number of clients the pool should contain by default this is set to 10.
    //idleTimeoutMillis       : 30000,
    //connectionTimeoutMillis : 2000
}

console.log(`db-config: conectando a la base "${target}"`);

export default DBConfig;
