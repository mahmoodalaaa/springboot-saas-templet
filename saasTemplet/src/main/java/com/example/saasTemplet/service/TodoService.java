package com.example.saasTemplet.service;

import com.example.saasTemplet.model.Todo;
import com.example.saasTemplet.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    public List<Todo> getTodos(String userId) {
        return todoRepository.findByUserId(userId);
    }

    @Transactional
    public Todo createTodo(String userId, String title) {
        Todo todo = new Todo();
        todo.setTitle(title);
        todo.setUserId(userId);
        return todoRepository.save(todo);
    }

    @Transactional
    public Todo toggleTodo(String userId, Long todoId) {
        Optional<Todo> todoOpt = todoRepository.findById(todoId);
        if (todoOpt.isPresent()) {
            Todo todo = todoOpt.get();
            if (todo.getUserId().equals(userId)) {
                todo.setCompleted(!todo.isCompleted());
                return todoRepository.save(todo);
            }
        }
        throw new RuntimeException("Todo not found or access denied");
    }

    @Transactional
    public void deleteTodo(String userId, Long todoId) {
        Optional<Todo> todoOpt = todoRepository.findById(todoId);
        if (todoOpt.isPresent()) {
            Todo todo = todoOpt.get();
            if (todo.getUserId().equals(userId)) {
                todoRepository.delete(todo);
                return;
            }
        }
        throw new RuntimeException("Todo not found or access denied");
    }
}
