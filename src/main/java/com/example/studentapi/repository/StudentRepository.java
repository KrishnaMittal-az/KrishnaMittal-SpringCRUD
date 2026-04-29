package com.example.studentapi.repository;

import com.example.studentapi.model.Student;

import java.util.List;
import java.util.Optional;

public interface StudentRepository {

    Student save(Student student);
    List<Student> findAll();
    Optional<Student> findById(Integer id);
    Student update(Integer id, Student student);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
