# User Story: Task Manager Application

**Jira Ticket**: EPMCDMETST-41952  
**Type**: Story  
**Status**: Open  
**Priority**: Medium  
**Project**: EPM-CDME-TEST  
**Reporter**: AbhraPratik Paul  
**Created**: 2026-05-11  

---

## User Story

As a user,  
I want to manage my tasks through a simple web interface,  
SO THAT I can track my to-do items and mark them as complete.

---

## Acceptance Criteria

### Primary Requirements

1. **Given** the task page is open, **when** the page loads, **then** existing tasks are displayed in a list.
2. **Given** the task input field is visible, **when** the user enters a task name and clicks "Add Task", **then** the task is saved and appears in the list.
3. **Given** a task exists, **when** the user clicks the checkbox next to it, **then** the task is marked as complete with strikethrough styling.
4. **Given** a task exists, **when** the user clicks the "Delete" button, **then** the task is removed from the list.
5. **Given** the task input is empty, **when** the user clicks "Add Task", **then** an error message displays stating "Task name is required".

### Additional Requirements

6. **Given** tasks exist, **when** the page loads, **then** completed tasks appear at the bottom of the list.
7. **Given** tasks exist, **when** the user clicks "Clear Completed", **then** all completed tasks are removed.
