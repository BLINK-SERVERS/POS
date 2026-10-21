# Game Center

_(fuente: HIG · game-center)_

### Platform considerations
*No additional considerations for iOS, iPadOS, macOS, or visionOS.*

### tvOS

**Display an optional image at the top of the dashboard.** In tvOS, you can add an additional piece of artwork to the dashboard to highlight your game’s aesthetic. Use a simple, easily recognizable image that looks great at a distance. Consider using your game’s logo or word mark; however, don’t use your app icon for this image. Use the following specifications to create a dashboard image.

|Attribute  |Value                       |
|-----------|----------------------------|
|Image size |600x180 pt (1200x360 px @2x)|
|Format     |PNG, TIF, or JPG            |
|Color space|sRGB or P3                  |
|Resolution |72 DPI (minimum)            |

### watchOS

**Be aware of Game Center support on watchOS.** While GameKit features and API are available for watchOS games, keep in mind that there’s no system-supported Game Center UI that you can invoke on watchOS. Instead, Game Center content for watchOS games appears on a connected iPhone.