package com.example.studentapi.repository;

import com.example.studentapi.model.Student;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class StudentRepositoryImpl implements StudentRepository {

    private final JdbcTemplate jdbc;

    public StudentRepositoryImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Student> STUDENT_ROW_MAPPER = (rs, rowNum) ->
            new Student(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("course")
            );

    @Override
    public Student save(Student student) {
        String sql = "INSERT INTO students (name, email, course) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, student.getName());
            ps.setString(2, student.getEmail());
            ps.setString(3, student.getCourse());
            return ps;
        }, keyHolder);

        Number generatedId = keyHolder.getKey();
        student.setId(generatedId.intValue());
        return student;
    }

    @Override
    public List<Student> findAll() {
        return jdbc.query("SELECT * FROM students ORDER BY id", STUDENT_ROW_MAPPER);
    }

    @Override
    public Optional<Student> findById(Integer id) {
        List<Student> results = jdbc.query(
                "SELECT * FROM students WHERE id = ?",
                STUDENT_ROW_MAPPER,
                id
        );
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public Student update(Integer id, Student student) {
        String sql = "UPDATE students SET name = ?, email = ?, course = ? WHERE id = ?";
        jdbc.update(sql, student.getName(), student.getEmail(), student.getCourse(), id);
        student.setId(id);
        return student;
    }

    @Override
    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM students WHERE id = ?", id);
    }

    @Override
    public boolean existsById(Integer id) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM students WHERE id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }
}
