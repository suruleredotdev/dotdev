<!-- TODO: vendor these?
  <script src="https://www.unpkg.com/lzma@2.2.1/index.js"></script>
  <script src="https://www.unpkg.com/buffer@5.6.0/index.js"></script>
-->

<style>
  .LIGHT .annotation {
    background-color: var(--bg-color-light);
    color: var(--txt-color-light);
    border-color: var(--border-color-light);
    border-top-width: 0.5px;
    border-top-style: solid; 
  }
  .DARK .annotation {
    background-color: var(--bg-color-dark);
    color: rgba(var(--txt-color-dark), 0.8);
    border-color: var(--border-color);
    border-top-width: 0.5px;
    border-top-style: solid; 
  }
  .annotation {
    display: block;
    font-weight: light;
    line-height: 15px;
  }

  .annotation > h3, .annotation > div {
    position: relative;
    top: 10px;
  }

  @media screen and (min-width: 1200px) {
    .annotation {
      position: relative;
      width: calc(7.3 * var(--bg-size));
      left: calc(18.3 * var(--bg-size));
      height: 0;
      padding: 0;
    }
  }

  /* inline on smaller screens */
  @media screen and (max-width: 1200px) {
    .annotation {
      position: relative;
      width: 100%;
      left: 0;
      height: 100%;
      padding-bottom: 20px;
      padding-top: 10px;
    }
  }


</style>

<script src="/itty.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js"></script>

<script src="/scripts/annotations.js"></script>