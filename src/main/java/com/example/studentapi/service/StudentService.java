package com.example.studentapi.service;

import com.example.studentapi.model.Student;

import java.util.List;

public interface StudentService {

    Student createStudent(Student student);
    List<Student> getAllStudents();
    Student getStudentById(Integer id);
    Student updateStudent(Integer id, Student student);
    void deleteStudent(Integer id);
}
