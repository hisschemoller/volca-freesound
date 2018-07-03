/**
 * Create a text file and present it to the user for download.
 * @param {String} filename Name of the file to download
 * @param {String} text Content of the file.
 */
function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/**
 * Create the receipt text and file from the received sound's data.
 * Search for the last transfer to a slot, to avoid overwritten earlier transfers.
 */
export default function downloadReceipt() {
  return (dispatch, getState) => {
    let fileContent = '';
    const header = `Sounds downloaded from Freesound.org and transferred to the Korg Volca Sample\n\n\n`;
    const state = getState();
    const reversedIDs = [...state.sounds.sounds.allIds].reverse();

    for (let i = 0, n = state.sounds.slotCount; i < n; i += 1) {
      // get the last sound transferred to the current slot
      const soundIDForSlot = reversedIDs.find(
        soundID => state.sounds.sounds.byId[soundID].slotIndex === i,
      );

      // if found create a text entry for the sound
      if (soundIDForSlot !== undefined) {
        const sound = state.sounds.sounds.byId[soundIDForSlot];
        // create the sound information entry
        const item = `Sample slot: ${sound.slotIndex}\n\nSound name: ${
          sound.name
        }\nID: ${sound.id}\nDuration: ${sound.duration}\nFile type: ${
          sound.type
        }\nLicense: ${sound.license}\nUser name: ${
          sound.username
        }\nFreesound URL: ${sound.url}\n\n.............\n\n`;

        // append item to text
        fileContent += item;
      }
    }

    fileContent = header + fileContent;
    download('volca-freesound-receipt.txt', fileContent);
  };
}
