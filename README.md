# PDF Tools
This tool is actually made only for me and my friend's personal uses. But making it along the way, I learned something new, and eh, I decided to publish it to the public because why not?

## What does this do?
It's mainly for converting multiple images to PDF (by utilizing [jsPDF](https://github.com/parallax/jsPDF)). It's nothing special basically. Just wrapping jsPDF on my makeshift UI.

### Why not use ImageMagick or stuff to convert to PDF?
Well, sometimes I'm too lazy to open my Laptop. And I like to learn new stuff anyways. So yeah, it's not like I didn't gain nothing working on this.

### There's tons of online PDF converter out there already.
Yes, but I'm a paranoid type of useless being. I rather made my own thing, than risking my data being stolen by third-parties. So I hope that this also useful for my fellow paranoid gang, because by utilizing jsPDF, everything you (and me) done with this is done without sending data out from your PC.

## Eughh, the code is unreadable
Yes, I'm aware of that and I'm sorry. I'm considering on refactoring a bunch of stuff going forward **if** I still feeling maintaining it.

## Can I use this?
Yeah, it's just a *"Prettified"* (even tho it's not that pretty lmfao) jsPDF. It's free (as in freedom) if you want to do sh*t to it (but still obeying the License). And it's client side, so no worries on my server resources.

You can even build it yourself by:
- Cloning this repository
    ```
    git clone https://github.com/hiyorun/pdf-tools
    ```
- Change your directory to `pdf-tools`
    ```
    cd pdf-tools
    ```
- Install all node dependencies (I use Yarn 1.22.22)
    ```
    yarn
    ```
- Run it
    ```
    yarn dev
    ```
- Or build it
    ```
    yarn build
    ```

