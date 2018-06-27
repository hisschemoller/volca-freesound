# Volca Freesound

### Fill the [Korg Volca Sample](http://www.korg.com/us/products/dj/volca_sample/) with random samples from [Freesound.org](https://freesound.org/).

This app downloads random files from the Freesound audio database and transfers them to a Korg Volca Sample connected to the computer's audio output. The app runs in any reasonably modern browser, desktop or mobile, as long as the device has a headphone or audio output. Please find the Volca Freesound app here:

[https://hisschemoller.github.io/volca-freesound/](https://hisschemoller.github.io/volca-freesound/)

### Korg Volca Sample

The [Volca Sample](http://www.korg.com/us/products/dj/volca_sample/) is a music instrument by Japanese manufacturer [Korg](http://www.korg.com/us/). It sequences and plays audio samples. The unusual thing about the Volca Sample is that it can't record sound. So it's not a sampler in the proper sense of the word, but a sample _player_. Samples must be transferred with a dedicated computer application.

### Freesound

[www.freesound.org](http://https.freesound.org) is a collaborative audio database where anyone can upload audio samples and recordings and share them under Creative Commons licenses. It's an initiative by the [Music Technology Group](https://www.upf.edu/web/mtg) of Universitat Pompeu Fabra in Barcelona. More information on their [about](https://freesound.org/help/about/) page. Freesound maintains an API to retrieve information and sounds from their database.

## Quick start

1.  Open [https://hisschemoller.github.io/volca-freesound/](https://hisschemoller.github.io/volca-freesound/)
2.  Set the computer's volume level close to maximum.
3.  For a neutral, clear signal make sure any sound effects or equalizers on the computer are switched off.
4.  Connect the computer's audio output to the Volca 'Sync in' input.
5.  Switch on the Volca.
6.  Select at least one slot in the app's grid of sample slots. That's the destination for the sample.
7.  Press 'Start' on the Volca Freesound page to start the transfer.

#### Signs that things work

On the Volca Freesound page

* One of the squares in the grid of sample slots lights up to indicate a transfer is going on to that sample slot.
* The progress bar shows the percentage of transfer that is done.

On the Volca Sample

* The display switches between the word 'data' and the number of the slot to indicate it's receiving sample data.
* The various LEDs on the interface pulsate while transferring.

## Overview

The app fills selected sample slots on the Volca Sample with random sounds from the Freesound database.

![Application screenshot](public/img/app_screen.png?raw=true 'Application screenshot')

#### Freesound sample licences and ownership

Audio files on Freesound can be of any type, WAV, FLAC, OGG etc. The files can only be accessed by registered users. Each sound however has an MP3 preview file that is free to download. It's these MP3 files that are used by this app. So a Freesound account is not necessary.

To use the audio in published or commercial projects however, the original high quality files might be desirable. It's also important to know that each sound can have its own licence type, with its own restrictions on the use of the sound.

So, to be able to store the information about the downloaded samples, the app lets you downloaded a receipt after transfer has finished. The receipt is a text file containing an overview of all slots and the samples that have been transferred to them, with filename, uploader's name, licence type, link to the sounds page on freesound.org and other information.

If you use or appreciate a sound, it always nice torate the sound or let the uploader know in a comment on the Freesound site.

#### Usage

When the app starts up it's set by default to overwrite all 100 sample slots on the Volca Sample. You might want to only select specific slots, so samples that are already on the machine and that you want to keep are not overwritten.

You might also want to set a maximum sample duration, so more samples fit on the machine, or else allow for longer samples. All these settings are described below in the next section.

Press Start to start file download and transfer.

The app will download MP3 files, convert them and tranfer them to the Volca Sample. On the slots grid you will see the slot currently receiving a sample in red. All the slots that have finished will be green.

You can interrupt the transfer by pressing Stop. The current transfer will continue until finished and then further transfer is halted.

After file transfer is finished the button will appear that lets you download the receipt text file with all the transferred samples' details.

## Sample and slot settings

Before starting transfer you might want to adjust some settimgs.

#### Maximum duration

The maximum length of samples can be set here. In seconds. The Volca Sample has 4MB of memory to store samples, which is not much. The shorter the duration, the more of the 100 sample slots will likely be filled.

When you change the maximum duration, the amount of available samples displayed underneath will be updated.

#### Normalize

The volume level of the downloaded files will be maximized before they are transferred to the Volca.

#### Double speed

Playback speed of the downloaded files will be doubled before they are transferred to the Volca Sample. This way they will take up only half the memory, so twice as much audio will fit in the Volca's 4MB. The samples' pitch however is doubled as well, so they must be pitched down twelve steps (one octave) to play back at their original pitch again.

#### Slots grid

The grid represents the 100 sample slots available on the Volca Sample. It lets you select individual slots in which random samples will be loaded. Click a slot to select or deselect it. When transfer starts only the selected slots will be overwritten with new samples.

#### Clear or select all slots

These buttons will unselect or select all the slots in the grid in one click.

#### Range selection

A range within the 100 sample slots can be selected to receive new samples. Set the lowest and the highest slot number and click the Set Range button. The selected or unselected state of all slots outside the range will remain unchanged.

## Tips and problem solving

#### Audio volume and optimal transfer

Transfer works best with a clear and loud audio signal. Switch off any audio effect or equalizer settings on your computer or soundcard, and set the volume level close to maximum.

Use new batteries or a power adapter on the Volca Sample.

## Error messages on the Volca Sample

#### Error CRC

I'll add information as soon as I know what this error means.

#### Error DCOD

I'll add information as soon as I know what this error means.

## About

To transfer samples the app uses [Syro.js](https://github.com/ptigas/syro.js), a Javascript version of the [Korg Syro SDK](http://korginc.github.io/volcasample/) that was made by [Panagiotis Tigas](http://ptigas.com/).

The app itself is built on [Kriasoft](https://www.kriasoft.com/)'s [React Starter Kit](https://github.com/kriasoft/react-starter-kit). It's my first React and Redux project in fact, that I built to get to know and use the framework and its tools.
