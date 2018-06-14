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
 */
export default function downloadReceipt() {
  return (dispatch, getState) => {
    let fileContent = '';
    const header = `Sounds downloaded from Freesound.org and transferred to the Korg Volca Sample\n\n\n`;
    const state = getState();
    const slotIndexes = [];
    const reversedIDs = [...state.sounds.sounds.allIds].reverse();
    reversedIDs.forEach(soundID => {
      const sound = state.sounds.sounds.byId[soundID];

      // only add the latest transfer to a slot
      if (slotIndexes.find(sound.slotIndex) === 'undefined') {
        slotIndexes.push(sound.slotIndex);

        // create the sound information entry
        const item = `Sample slot: ${sound.slotIndex}\n\nSound name: ${
          sound.name
        }\nID: ${sound.id}\nDuration: ${sound.duration}\nFile type: ${
          sound.type
        }\nLicense: ${sound.license}\nUser name: ${
          sound.username
        }\nFreesound URL: ${sound.url}\n\n.............\n\n`;

        // prepend item, because IDs are reversed
        fileContent = item + fileContent;
      }
    });
    fileContent = header + fileContent;
    download('volca-freesound-receipt.txt', fileContent);
  };
}
