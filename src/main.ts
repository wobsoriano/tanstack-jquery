import './init'
import './tanstack-jquery'

async function getTodos(): Promise<{
  todos: Array<{
    id: number;
    todo: string;
    completed: boolean;
  }>
}> {
  return $.ajax({ url: 'https://dummyjson.com/todos', method: 'GET' }).promise()
}

$.query({
  queryKey: ['todos'],
  queryFn: getTodos,
  beforeSend() {
    $('#loading').show();
    $('#error-message').hide();
    $('#todo-list').hide();
  },
  onSuccess(data) {
    $('#loading').hide();
    $('#error-message').hide();
    $('#todo-list').show();

    $('#todo-list').html(
      data.todos.map((todo) => {
        return `<li class="${todo.completed ? 'completed' : ''}">${todo.todo}</li>`;
      }).join('')
    );
  },
  onError() {
    $('#loading').hide();
    $('#todo-list').hide();
    $('#error-message').text('Failed to load todos. Please try again.').show();
  }
})
