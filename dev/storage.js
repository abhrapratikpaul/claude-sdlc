let _saveErrorCallback = null;

export function setSaveErrorCallback(fn) {
  _saveErrorCallback = fn;
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem('tasks');
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('loadTasks: failed to parse stored tasks', err);
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (err) {
    console.error('saveTasks: failed to write to localStorage', err);
    if (typeof _saveErrorCallback === 'function') {
      _saveErrorCallback();
    }
  }
}
