package com.example.saasTemplet.controller;

import com.example.saasTemplet.model.Todo;
import com.example.saasTemplet.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public List<Todo> getTodos(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return todoService.getTodos(userId);
    }

    @PostMapping
    public Todo createTodo(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        String userId = jwt.getSubject();
        return todoService.createTodo(userId, body.get("title"));
    }

    @PutMapping("/{id}/toggle")
    public Todo toggleTodo(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        String userId = jwt.getSubject();
        return todoService.toggleTodo(userId, id);
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        String userId = jwt.getSubject();
        todoService.deleteTodo(userId, id);
    }
}
