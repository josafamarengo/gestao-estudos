// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    gestao_estudos_lib::run();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_all_subjects, insert_subject])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}

use rusqlite::{params, Connection, Result, OptionalExtension};
use serde::Serialize;
use tauri::command;
use std::error::Error;

#[derive(Serialize)]
struct Subject {
    id: i32,
    name: String,
    number_of_questions: i32,
    points_per_question: f64,
    number_of_lessons: i32,
}

fn open_db() -> Result<Connection> {
    Connection::open("app.db").map_err(|e| {
        eprintln!("Error opening database: {}", e);
        e
    })
}

#[command]
fn insert_subject(name: &str, number_of_questions: i32, points_per_question: f64) -> Result<(), String> {
    let conn = open_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM subjects WHERE name = ?").map_err(|e| e.to_string())?;
    let count: i64 = stmt.query_row(params![name], |row| row.get(0)).map_err(|e| e.to_string())?;

    if count > 0 {
        return Err("A disciplina já existe.".to_string());
    }
    
    conn.execute(
        "INSERT INTO subjects (name, number_of_questions, points_per_question) 
         VALUES (?1, ?2, ?3)",
        params![name, number_of_questions, points_per_question],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

fn insert_topic(name: &str, subject_id: i32, questions_answered: i32, right_answers: i32) -> Result<()> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM topics WHERE name = ?")?;
    let count: i64 = stmt.query_row(params![name], |row| row.get(0))?;

    if count == 0 {
        conn.execute(
            "INSERT INTO topics (name, subject, questions_answered, right_answers) 
             VALUES (?1, ?2, ?3, ?4)",
            params![name, subject_id, questions_answered, right_answers],
        )?;
    }
    Ok(())
}

fn insert_lesson(name: &str, topic_id: i32, time: i32, finished: &str) -> Result<()> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM lessons WHERE name = ?")?;
    let count: i64 = stmt.query_row(params![name], |row| row.get(0))?;

    if count == 0 {
        conn.execute(
            "INSERT INTO lessons (name, topic, time, finished) 
             VALUES (?1, ?2, ?3, ?4)",
            params![name, topic_id, time, finished],
        )?;
    }
    Ok(())
}

fn insert_setting(setting_name: &str, setting_value: &str) -> Result<()> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM settings WHERE setting_name = ?")?;
    let count: i64 = stmt.query_row(params![setting_name], |row| row.get(0))?;

    if count == 0 {
        conn.execute(
            "INSERT INTO settings (setting_name, setting_value) 
             VALUES (?1, ?2)",
            params![setting_name, setting_value],
        )?;
    }
    Ok(())
}

#[command]
fn get_all_subjects() -> Result<Vec<Subject>, String> {
    let conn = open_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT s.id, s.name, s.number_of_questions, s.points_per_question, 
                COALESCE(COUNT(l.id), 0) AS number_of_lessons
         FROM subjects s
         LEFT JOIN topics t ON s.id = t.subject
         LEFT JOIN lessons l ON t.id = l.topic
         GROUP BY s.id, s.name, s.number_of_questions, s.points_per_question"
    ).map_err(|e| e.to_string())?;

    let subjects_iter = stmt.query_map(params![], |row| {
        Ok(Subject {
            id: row.get(0)?,
            name: row.get(1)?,
            number_of_questions: row.get(2)?,
            points_per_question: row.get(3)?,
            number_of_lessons: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut subjects = Vec::new();
    for subject in subjects_iter {
        subjects.push(subject.map_err(|e| e.to_string())?);
    }
    Ok(subjects)
}


fn get_all_topics() -> Result<Vec<(i32, String, i32, i32, i32)>> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT * FROM topics")?;
    let topics_iter = stmt.query_map(params![], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
    })?;
    
    let mut topics = Vec::new();
    for topic in topics_iter {
        topics.push(topic?);
    }
    Ok(topics)
}

fn get_all_lessons() -> Result<Vec<(i32, String, i32, i32, String)>> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT * FROM lessons")?;
    let lessons_iter = stmt.query_map(params![], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
    })?;
    
    let mut lessons = Vec::new();
    for lesson in lessons_iter {
        lessons.push(lesson?);
    }
    Ok(lessons)
}

fn get_all_settings() -> Result<Vec<(i32, String, String)>> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT * FROM settings")?;
    let settings_iter = stmt.query_map(params![], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })?;
    
    let mut settings = Vec::new();
    for setting in settings_iter {
        settings.push(setting?);
    }
    Ok(settings)
}

fn get_subject_by_id(id: i32) -> Result<Option<(i32, String, i32, f64, i32)>> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT * FROM subjects WHERE id = ?")?;
    let subject = stmt.query_row(params![id], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
    }).optional()?;
    Ok(subject)
}

#[command]
fn delete_subject(id: i32) -> Result<(), String> {
    let conn = open_db().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM subjects WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn log_frontend_error(message: String) -> Result<(), String> {
    println!("Frontend Error: {}", message);
    Ok(())
}

