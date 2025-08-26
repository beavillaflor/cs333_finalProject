// tooltip action function
// used https://svelte.dev/playground/dd6754a2ad0547c5b1c1ea37c0293fef?version=5.38.3#H4sIAAAAAAAAE-1Y3WrjRhR-lbPKgh3qyGto90KOU9I07S7sDyyBNtQFjz3H9nTlGXXmSLYxeooWCr3pc_St-ghlZiRZ8k_i0N6U7kWIdH7nnO_oO4M3gWQLDKIgNRiRUjGJJOgEUxGjCaIfNgGtE6u2gqBTGl8nSWgyjMnKxszgIflESUJJJoiCSzPRIqGroRySWCRKE9z5XDDVagGtsFu8F-6tfs10A8XBIK_MC8kRO2bKx6y37xRmPet32d2eSl7Oe0CCYhwMA5oLA8IAg5lGJCFnPgKbkFByGECtV1evMI4VLJWOed3q2WV33ntiZMh6zeBZ71h4yHq1DGUvH0szUYtESZQ0DBwUlz4ADWkvTWX6zBn6VJclSldBJyBcURCRTjHvHBmTJqbNUdnTHRkXXDlsYyRfHgyg5VG3ImFeqQw1chjAlMUGK82qelq7J_s3TaXv3kKlBt9nqNuYoaRz2Pg21MPZyrwnrWAAzjBM2Ay_h8_gi0KzbmjuK02-n-6tynAn3b8S9w2yDNsHS9h2JN8ddy4yK1cyckGsy2BTtSUfSoBSF9sEhdIly-ueC1UpbYW5HywTK4KuGxkuMpdycyamW7xcDHsKMLT2Q6uSCDbrPFn1IcYpRbBZ2ZdhAJOYGeNM3MwMg6uNm4W8jL7pimnu6nLR3BnCkgyKxoyV5qgj6CUrMCoWHM445_1Subowc8bV0huUf3UTNvk40yqVPILlXBD263EvNOMiNRF8nqwKRcI4F3LWECkjLHIRsLFRcUp1dNzJn_RhfaPV4tqNwkOf2CGrEz-2_o5wtStYN3m0AagvuYDVTnBe9aHEt5LuIdqA0kb9T6E4lKfhWC6kn0wTuYa8htXDu3MPaMeTsoCrYo0ieBtjXGzZyKLJRVax5hZ_9-Z9bsqt0D-JTrtdePf-7jYC7WgCaI4wcoFHwIi0GKeEHSAFiXaeYOZqadeVteQ4ZWlMMNZqaVCXZ6hCa1zgYuwUYOwuILDogpIw2hLXqBjDYncURYczpOvyBO2W07bOC3xLG3_qw2bFbDe7AgOQuCzhaRddGFKiVWIiqN6L40S-yZ2teBXV90FNsa4r7itFXj0R0zOkCLiapO7wY8XXhTY_f8JO2q0pfG6QtqUcOeHB8-Xnp62s_ZQcDWm1bpeI1AbJkNJHJqmJnjmAcMd3vNYPx2eFB-P81hbxRhhCibrdqnZjq7MdcusN8IiTm73Sy9Xrkz7iZgeu9LLgnFd3F42Ualm2rGrQdqiaU3tqIaf6HqvnNO8jZXkI8qHMn0aXWe8oY5aqGmn-U_77P9Mc-eHzK3iwZZeJRkZ46yO0W1xklT0XWWixvPEI2Jt01UqvdTsSBjAqB-jBpX7SWj--2B9Y7QeX-9H1Xl1mnm927ux5zdnfbOom902TUdmIOlGHLElQ8pu5iHmbi-wphF11NLS5bVsPHXC02_-QVLJrfN8wfpy4mzX4Odqp4RN3f-JuR9Afbq-_fnsbLniTt-viGmefwaj2O4glCvnXH7_8CXOixETd7lqllIZj7L749ufXSr18KV7MCqPfAT5gzAg5fECjUj1BM5QXcJeS0oLFpgriL8khx6xLhbLrf14xPtavvwF8x6S9_kKMTNuvQKO_di_wS7iZoyXilOxMG4RYyI8mAut8AXdLQWRZrUxHXhBO1KIbizlLiTnDr2I121qVGmdm1e9waWJshmoYycrAJj7zVUHxv6inidGPnYCYiJdC8iByPxLkfwP3g9AuCBQAAA==
// for reference 

export function tooltip(element, text) { // export so can use in plane seating
  let tooltipDiv;
  
  function showTooltip(event) {
    tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'svelte-tooltip';
    tooltipDiv.textContent = text;
    document.body.appendChild(tooltipDiv);
    
    //updated code starts here
    tooltipDiv.style.position = 'fixed';
    tooltipDiv.style.pointerEvents = 'none';
    tooltipDiv.style.left = event.clientX + 'px';
    tooltipDiv.style.top = event.clientY - 10 + 'px';
  }
  
    function moveTooltip(event) {
    if (tooltipDiv) {
      tooltipDiv.style.left = event.clientX + 'px';
      tooltipDiv.style.top = event.clientY - 10 + 'px';
    }
  }

  function hideTooltip() {
    if (tooltipDiv) {
      tooltipDiv.remove();
      tooltipDiv = null;
    }
  }
  
  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mousemove', moveTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  
  return {
    destroy() {
      element.removeEventListener('mouseenter', showTooltip);
      element.removeEventListener('mousemove', moveTooltip);
      //updated code ends here
      element.removeEventListener('mouseleave', hideTooltip);
      if (tooltipDiv) tooltipDiv.remove();
    },
    update(newText) {
      text = newText;
    }
  };
}
