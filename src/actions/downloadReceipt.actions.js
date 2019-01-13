const urls = {
  download: null,
};

/**
 * Create a text file and present it to the user for download.
 * @param {String} filename Name of the file to download
 * @param {String} text Content of the file.
 */
function download(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  // release previous url in case of multiple uses in one session
  if (urls.download) {
    window.URL.revokeObjectURL(urls.download);
  }

  // create an addressable version of the blob
  urls.download = window.URL.createObjectURL(blob);

  const element = document.createElement('a');
  element.setAttribute('href', urls.download);
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
    const newLine = `\r\n`;

    for (let i = 0, n = state.sounds.slotCount; i < n; i += 1) {
      // get the last sound transferred to the current slot
      const soundIDForSlot = reversedIDs.find(
        soundID => state.sounds.sounds.byId[soundID].slotIndex === i,
      );

      // if found create a text entry for the sound
      if (soundIDForSlot !== undefined) {
        const sound = state.sounds.sounds.byId[soundIDForSlot];

        // create the sound information entry
        const item = `Sample slot: ${
          sound.slotIndex
        }${newLine}${newLine}Sound name: ${sound.name}${newLine}ID: ${
          sound.id
        }${newLine}Duration: ${sound.duration}${newLine}File type: ${
          sound.type
        }${newLine}License: ${sound.license}${newLine}User name: ${
          sound.username
        }\nFreesound URL: ${
          sound.url
        }${newLine}${newLine}.............${newLine}${newLine}`;

        // append item to text
        fileContent += item;
      }
    }

    fileContent = header + fileContent;
    download('volca-freesound-receipt.txt', fileContent);
  };
}
