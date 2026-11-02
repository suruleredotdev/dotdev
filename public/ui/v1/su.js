/* surulere.dev UI v1 — optional behaviour for hand-built pages.
 *
 * The CSS works without this file. It adds two things, both by delegation so
 * it can load once with `defer` and cover markup added later:
 *   [data-su-open="id"]  opens <dialog id="id" class="su-sheet"> as a modal
 *   clicking a sheet's backdrop closes it (Escape already does, natively)
 * React apps don't need it: <Sheet> does the same in its own handlers.
 */
(function () {
  if (window.__suUi) return;
  window.__suUi = "1";

  document.addEventListener("click", function (event) {
    var target = event.target;
    var opener = target.closest && target.closest("[data-su-open]");
    if (opener) {
      var sheet = document.getElementById(opener.getAttribute("data-su-open"));
      if (sheet && typeof sheet.showModal === "function" && !sheet.open) {
        event.preventDefault();
        sheet.showModal();
      }
      return;
    }
    // A click on the <dialog> element itself, not its content, is a click on
    // the backdrop (the content fills the box edge to edge).
    if (target.tagName === "DIALOG" && target.classList.contains("su-sheet")) {
      var r = target.getBoundingClientRect();
      var inside =
        event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside) target.close();
    }
  });
})();
