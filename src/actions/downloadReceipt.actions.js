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

export default function downloadReceipt() {
  return (dispatch, getState) => {
    let txt = `Sounds downloaded from Freesound.org and transferred to the Korg Volca Sample\n\n\n`;
    const state = getState();
    state.sounds.sounds.allIds.forEach(soundID => {
      const sound = state.sounds.sounds.byId[soundID];
      txt += `Sample slot: ${sound.slotIndex}\n\nSound name: ${
        sound.name
      }\nID: ${sound.id}\nDuration: ${sound.duration}\nFile type: ${
        sound.type
      }\nLicense: ${sound.license}\nUser name: ${
        sound.username
      }\nFreesound URL: ${sound.url}\n\n.............\n\n`;
    });
    download('volca-freesound-receipt.txt', txt);
  };
}
