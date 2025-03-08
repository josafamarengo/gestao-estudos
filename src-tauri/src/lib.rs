// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rusqlite::{params, Connection, Result, OptionalExtension};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = initialize_db() {
        eprintln!("Erro ao inicializar o banco de dados: {}", e);
        return;
    }
}

fn initialize_db() -> Result<(), Box<dyn std::error::Error>> {
    let conn = open_db()?; // Abre o banco de dados
    create_table_subjects(&conn)?;
    create_table_topics(&conn)?;
    create_table_lessons(&conn)?;
    create_table_settings(&conn)?;
    Ok(())
}

fn open_db() -> Result<Connection> {
    Connection::open("app.db").map_err(|e| {
        eprintln!("Error opening database: {}", e);
        e
    })
}


fn create_table_subjects(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS subjects (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE,
                  number_of_questions INTEGER NOT NULL,
                  points_per_question REAL NOT NULL
                  )",
        params![],
    )?;
    Ok(())
}

fn create_table_topics(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS topics (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE,
                  subject INTEGER NOT NULL,
                  questions_answered INTEGER,
                  right_answers INTEGER,
                  FOREIGN KEY(subject) REFERENCES subjects(id)
                  )",
        params![],
    )?;
    Ok(())
}

fn create_table_lessons(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS lessons (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE,
                  topic INTEGER NOT NULL,
                  time INTEGER DEFAULT 0,
                  finished TEXT DEFAULT 'N',
                  FOREIGN KEY(topic) REFERENCES topics(id)
                  )",
        params![],
    )?;
    Ok(())
}

fn create_table_settings(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
                  id INTEGER PRIMARY KEY,
                  setting_name TEXT NOT NULL,
                  setting_value TEXT NOT NULL
                  )",
        params![],
    )?;
    Ok(())
}

