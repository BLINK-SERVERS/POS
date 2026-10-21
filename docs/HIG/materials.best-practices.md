# Materials

_(fuente: HIG · materials)_

### Platform considerations
### iOS, iPadOS

In addition to Liquid Glass, iOS and iPadOS continue to provide four standard materials — ultra-thin, thin, regular (default), and thick — which you can use in the content layer to help create visual distinction.

iOS and iPadOS also define vibrant colors for labels, fills, and separators that are specifically designed to work with each material. Labels and fills both have several levels of vibrancy; separators have one level. The name of a level indicates the relative amount of contrast between an element and the background: The default level has the highest contrast, whereas quaternary (when it exists) has the lowest contrast.

Except for quaternary, you can use the following vibrancy values for labels on any material. In general, avoid using quaternary on top of the <doc://com.apple.documentation/documentation/SwiftUI/Material/thin> and <doc://com.apple.documentation/documentation/SwiftUI/Material/ultraThin> materials, because the contrast is too low.

- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/label> (default)
- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel>
- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel>
- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/quaternaryLabel>

You can use the following vibrancy values for fills on all materials.

- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/fill> (default)
- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/secondaryFill>
- <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/tertiaryFill>

The system provides a single, default vibrancy value for a [separator](doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/separator), which works well on all materials.

### macOS

macOS provides several standard materials with designated purposes, and vibrant versions of all [system colors](/design/Human-Interface-Guidelines/color#Specifications). For developer guidance, see <doc://com.apple.documentation/documentation/AppKit/NSVisualEffectView/Material-swift.enum>.

**Choose when to allow vibrancy in custom views and controls.** Depending on configuration and system settings, system views and controls use vibrancy to make foreground content stand out against any background. Test your interface in a variety of contexts to discover when vibrancy enhances the appearance and improves communication.

**Choose a background blending mode that complements your interface design.** macOS defines two modes that blend background content: behind window and within window. For developer guidance, see <doc://com.apple.documentation/documentation/AppKit/NSVisualEffectView/BlendingMode-swift.enum>.

### tvOS

In tvOS, Liquid Glass appears throughout navigation elements and system experiences such as Top Shelf and Control Center. Certain interface elements, like image views and buttons, adopt Liquid Glass when they gain focus.

In addition to Liquid Glass, tvOS continues to provide standard materials, which you can use to help define structure in the content layer. The thickness of a standard material affects how prominently the underlying content shows through. For example, consider using standard materials in the following ways:

|Material                                                                |Recommended for                                                                       |
|------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
|<doc://com.apple.documentation/documentation/SwiftUI/Material/ultraThin>|Full-screen views that require a light color scheme                                   |
|<doc://com.apple.documentation/documentation/SwiftUI/Material/thin>     |Overlay views that partially obscure onscreen content and require a light color scheme|
|<doc://com.apple.documentation/documentation/SwiftUI/Material/regular>  |Overlay views that partially obscure onscreen content                                 |
|<doc://com.apple.documentation/documentation/SwiftUI/Material/thick>    |Overlay views that partially obscure onscreen content and require a dark color scheme |

### visionOS

In visionOS, windows generally use an unmodifiable system-defined material called *glass* that helps people stay grounded by letting light, the current Environment, virtual content, and objects in people’s surroundings show through. Glass is an adaptive material that limits the range of background color information so a window can continue to provide contrast for app content while becoming brighter or darker depending on people’s physical surroundings and other virtual content.

> Note: visionOS doesn’t have a distinct Dark Mode setting. Instead, glass automatically adapts to the luminance of the objects and colors behind it.

**Prefer translucency to opaque colors in windows.** Areas of opacity can block people’s view, making them feel constricted and reducing their awareness of the virtual and physical objects around them.

**If necessary, choose materials that help you create visual separations or indicate interactivity in your app.** If you need to create a custom component, you may need to specify a system material for it. Use the following examples for guidance.

- The <doc://com.apple.documentation/documentation/SwiftUI/Material/thin> material brings attention to interactive elements like buttons and selected items.
- The <doc://com.apple.documentation/documentation/SwiftUI/Material/regular> material can help you visually separate sections of your app, like a sidebar or a grouped table view.
- The <doc://com.apple.documentation/documentation/SwiftUI/Material/thick> material lets you create a dark element that remains visually distinct when it’s on top of an area that uses a `regular` background.

To ensure foreground content remains legible when it displays on top of a material, visionOS applies vibrancy to text, symbols, and fills. Vibrancy enhances the sense of depth by pulling light and color forward from both virtual and physical surroundings.

visionOS defines three vibrancy values that help you communicate a hierarchy of text, symbols, and fills.

- Use <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/label> for standard text.
- Use <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel> for descriptive text like footnotes and subtitles.
- Use <doc://com.apple.documentation/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel> for inactive elements, and only when text doesn’t need high legibility.

### watchOS

**Use materials to provide context in a full-screen modal view.** Because full-screen modal views are common in watchOS, the contrast provided by material layers can help orient people in your app and distinguish controls and system elements from other content. Avoid removing or replacing material backgrounds for modal sheets when they’re provided by default.