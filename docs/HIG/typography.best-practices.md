# Typography

_(fuente: HIG · typography)_

### Platform considerations
### iOS, iPadOS

SF Pro is the system font in iOS and iPadOS. iOS and iPadOS apps can also use NY.

### macOS

SF Pro is the system font in macOS. NY is available for Mac apps built with Mac Catalyst. macOS doesn’t support Dynamic Type.

**When necessary, use dynamic system font variants to match the text in standard controls.** Dynamic system font variants give your text the same look and feel of the text that appears in system-provided controls. Use the variants listed below to achieve a look that’s consistent with other apps on the platform.

|Dynamic font variant                       |API                                                                                    |
|-------------------------------------------|---------------------------------------------------------------------------------------|
|Control content                            |<doc://com.apple.documentation/documentation/AppKit/NSFont/controlContentFont(ofSize:)>|
|Label                                      |<doc://com.apple.documentation/documentation/AppKit/NSFont/labelFont(ofSize:)>         |
|Menu                                       |<doc://com.apple.documentation/documentation/AppKit/NSFont/menuFont(ofSize:)>          |
|Menu bar                                   |<doc://com.apple.documentation/documentation/AppKit/NSFont/menuBarFont(ofSize:)>       |
|Message                                    |<doc://com.apple.documentation/documentation/AppKit/NSFont/messageFont(ofSize:)>       |
|Palette                                    |<doc://com.apple.documentation/documentation/AppKit/NSFont/paletteFont(ofSize:)>       |
|Title                                      |<doc://com.apple.documentation/documentation/AppKit/NSFont/titleBarFont(ofSize:)>      |
|Tool tips                                  |<doc://com.apple.documentation/documentation/AppKit/NSFont/toolTipsFont(ofSize:)>      |
|Document text (user)                       |<doc://com.apple.documentation/documentation/AppKit/NSFont/userFont(ofSize:)>          |
|Monospaced document text (user fixed pitch)|<doc://com.apple.documentation/documentation/AppKit/NSFont/userFixedPitchFont(ofSize:)>|
|Bold system font                           |<doc://com.apple.documentation/documentation/AppKit/NSFont/boldSystemFont(ofSize:)>    |
|System font                                |<doc://com.apple.documentation/documentation/AppKit/NSFont/systemFont(ofSize:)>        |

### tvOS

SF Pro is the system font in tvOS, and apps can also use NY.

### visionOS

SF Pro is the system font in visionOS. If you use NY, you need to specify the type styles you want.

visionOS uses bolder versions of the Dynamic Type body and title styles and it introduces Extra Large Title 1 and Extra Large Title 2 for wide, editorial-style layouts. For guidance using vibrancy to indicate hierarchy in text and symbols, see [Materials > visionOS](/design/Human-Interface-Guidelines/materials#visionOS).

**In general, prefer 2D text.** The more visual depth text characters have, the more difficult they can be to read. Although a small amount of 3D text can provide a fun visual element that draws people’s attention, if you’re going to display content that people need to read and understand, prefer using text that has little or no visual depth.

**Make sure text looks good and remains legible when people scale it.** Use a text style that makes the text look good at full scale, then test it for legibility at different scales.

**Maximize the contrast between text and the background of its container.** By default, the system displays text in white, because this color tends to provide a strong contrast with the default system background material, making text easier to read. If you want to use a different text color, be sure to test it in a variety of contexts.

**If you need to display text that’s not on a background, consider making it bold to improve legibility.** In this situation, you generally want to avoid adding shadows to increase text contrast. The current space might not include a visual surface on which to cast an accurate shadow, and you can’t predict the size and density of shadow that would work well with a person’s current Environment.

**Keep text facing people as much as possible.** If you display text that’s associated with a point in space, such as a label for a 3D object, you generally want to use *billboarding* — that is, you want the text to face the wearer regardless of how they or the object move. If you don’t rotate text to remain facing the wearer, the text can become impossible to read because people may view it from the side or a highly oblique angle. For example, imagine a virtual lamp that appears to be on a physical desk with a label anchored directly above it. For the text to remain readable, the label needs to rotate around the y-axis as people move around the desk; in other words, the baseline of the text needs to remain perpendicular to the person’s line of sight.

### watchOS

SF Compact is the system font in watchOS, and apps can also use NY. In complications, watchOS uses SF Compact Rounded.