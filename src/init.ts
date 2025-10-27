import $ from 'jquery'

window.$ = $;
window.jQuery = $;

declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}
