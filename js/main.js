/** Include any other scripts here - this will combine them via gulp for the final output script. */

((window, document) => {
  /*******************************************************************************/
  /* MODULE
          /*******************************************************************************/

  const Base = (() => {
    /**
     * Runs when the document is ready.
     */
    const ready = () => {};

    /**
     * Runs when the window is loaded.
     */
    const load = () => {};

    /**
     * Return our module's publicly accessible functions.
     */
    return {
      ready: ready,
      load: load,
    };
  })();

  /*******************************************************************************/
  /* MODULE INITIALISE
          /*******************************************************************************/

  document.addEventListener("DOMContentLoaded", function () {
    Base.ready();
  });

  window.addEventListener("load", function () {
    Base.load();
  });
})(window, document);
