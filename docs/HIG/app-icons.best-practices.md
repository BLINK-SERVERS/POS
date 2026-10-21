# App icons

_(fuente: HIG · app-icons)_

### Platform considerations
*No additional considerations for iOS, iPadOS, or macOS.*

### tvOS

**Include a safe zone to ensure the system doesn’t crop your content.** When someone focuses your app icon, the system may crop content around the edges as the icon scales and moves. To ensure that your icon’s content is always visible, keep a safe zone around it. Be aware that the safe zone can vary, depending on the image size, layer depth, and motion, and the system crops foreground layers more than background layers.

### visionOS

**Avoid adding a shape that’s intended to look like a hole or concave area to the background layer.** The system-added shadow and specular highlights can make such a shape stand out instead of recede.

### watchOS

**Avoid using black for your icon’s background.** Lighten a black background so the icon doesn’t blend into the display background.