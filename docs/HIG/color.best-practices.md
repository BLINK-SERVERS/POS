# Color

_(fuente: HIG · color)_

### Best practices
**Avoid using the same color to mean different things.** Use color consistently throughout your interface, especially when you use it to help communicate information like status or interactivity. For example, if you use your brand color to indicate that a borderless button is interactive, using the same or similar color to stylize noninteractive text is confusing.

**Make sure all your app’s colors work well in light, dark, and increased contrast contexts.** iOS, iPadOS, macOS, and tvOS offer both light and [dark](/design/Human-Interface-Guidelines/dark-mode) appearance settings. [System colors](/design/Human-Interface-Guidelines/color#System-colors) vary subtly depending on the system appearance, adjusting to ensure proper color differentiation and contrast for text, symbols, and other elements. With the Increase Contrast setting turned on, the color differences become far more apparent. When possible, use system colors, which already define variants for all these contexts. If you define a custom color, make sure to supply light and dark variants, and an increased contrast option for each variant that provides a significantly higher amount of visual differentiation. Even if your app ships in a single appearance mode, provide both light and dark colors to support Liquid Glass adaptivity in these contexts.

**Test your app’s color scheme under a variety of lighting conditions.** Colors can look different when you view your app outside on a sunny day or in dim light. In bright surroundings, colors look darker and more muted. In dark environments, colors appear bright and saturated. In visionOS, colors can look different depending on the colors of a wall or object in a person’s physical surroundings and how it reflects light. Adjust app colors to provide an optimal viewing experience in the majority of use cases.

**Test your app on different devices.** For example, the True Tone display — available on certain iPhone, iPad, and Mac models — uses ambient light sensors to automatically adjust the white point of the display to adapt to the lighting conditions of the current environment. Apps that primarily support reading, photos, video, and gaming can strengthen or weaken this effect by specifying a white point adaptivity style (for developer guidance, see <doc://com.apple.documentation/documentation/BundleResources/Information-Property-List/UIWhitePointAdaptivityStyle>). Test tvOS apps on multiple brands of HD and 4K TVs, and with different display settings. You can also test the appearance of your app using different color profiles on a Mac — such as P3 and Standard RGB (sRGB) — by choosing a profile in System Settings > Displays. For guidance, see [Color management](/design/Human-Interface-Guidelines/color#Color-management).

**Consider how artwork and translucency affect nearby colors.** Variations in artwork sometimes warrant changes to nearby colors to maintain visual continuity and prevent interface elements from becoming overpowering or underwhelming. Maps, for example, displays a light color scheme when in map mode but switches to a dark color scheme when in satellite mode. Colors can also appear different when placed behind or applied to a translucent element like a toolbar.

**If your app lets people choose colors, prefer system-provided color controls where available.** Using built-in color pickers provides a consistent user experience, in addition to letting people save a set of colors they can access from any app. For developer guidance, see <doc://com.apple.documentation/documentation/SwiftUI/ColorPicker>.

### Platform considerations
### iOS, iPadOS

iOS defines two sets of dynamic background colors — *system* and *grouped* — each of which contains primary, secondary, and tertiary variants that help you convey a hierarchy of information. In general, use the grouped background colors (<doc://com.apple.documentation/documentation/UIKit/UIColor/systemGroupedBackground>, <doc://com.apple.documentation/documentation/UIKit/UIColor/secondarySystemGroupedBackground>, and <doc://com.apple.documentation/documentation/UIKit/UIColor/tertiarySystemGroupedBackground>) when you have a grouped table view; otherwise, use the system set of background colors (<doc://com.apple.documentation/documentation/UIKit/UIColor/systemBackground>, <doc://com.apple.documentation/documentation/UIKit/UIColor/secondarySystemBackground>, and <doc://com.apple.documentation/documentation/UIKit/UIColor/tertiarySystemBackground>).

With both sets of background colors, you generally use the variants to indicate hierarchy in the following ways:

- Primary for the overall view
- Secondary for grouping content or elements within the overall view
- Tertiary for grouping content or elements within secondary elements

For foreground content, iOS defines the following dynamic colors:

|Color           |Use for…                                                            |UIKit API                                                                  |
|----------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
|Label           |A text label that contains primary content.                         |<doc://com.apple.documentation/documentation/UIKit/UIColor/label>          |
|Secondary label |A text label that contains secondary content.                       |<doc://com.apple.documentation/documentation/UIKit/UIColor/secondaryLabel> |
|Tertiary label  |A text label that contains tertiary content.                        |<doc://com.apple.documentation/documentation/UIKit/UIColor/tertiaryLabel>  |
|Quaternary label|A text label that contains quaternary content.                      |<doc://com.apple.documentation/documentation/UIKit/UIColor/quaternaryLabel>|
|Placeholder text|Placeholder text in controls or text views.                         |<doc://com.apple.documentation/documentation/UIKit/UIColor/placeholderText>|
|Separator       |A separator that allows some underlying content to be visible.      |<doc://com.apple.documentation/documentation/UIKit/UIColor/separator>      |
|Opaque separator|A separator that doesn’t allow any underlying content to be visible.|<doc://com.apple.documentation/documentation/UIKit/UIColor/opaqueSeparator>|
|Link            |Text that functions as a link.                                      |<doc://com.apple.documentation/documentation/UIKit/UIColor/link>           |

### macOS

macOS defines the following dynamic system colors (you can also view them in the Developer palette of the standard Color panel):

|Color                                         |Use for…                                                                                                                                |AppKit API                                                                                             |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
|Alternate selected control text color         |The text on a selected surface in a list or table.                                                                                      |<doc://com.apple.documentation/documentation/AppKit/NSColor/alternateSelectedControlTextColor>         |
|Alternating content background colors         |The backgrounds of alternating rows or columns in a list, table, or collection view.                                                    |<doc://com.apple.documentation/documentation/AppKit/NSColor/alternatingContentBackgroundColors>        |
|Control accent                                |The accent color people select in System Settings.                                                                                      |<doc://com.apple.documentation/documentation/AppKit/NSColor/controlAccentColor>                        |
|Control background color                      |The background of a large interface element, such as a browser or table.                                                                |<doc://com.apple.documentation/documentation/AppKit/NSColor/controlBackgroundColor>                    |
|Control color                                 |The surface of a control.                                                                                                               |<doc://com.apple.documentation/documentation/AppKit/NSColor/controlColor>                              |
|Control text color                            |The text of a control that is available.                                                                                                |<doc://com.apple.documentation/documentation/AppKit/NSColor/controlTextColor>                          |
|Current control tint                          |The system-defined control tint.                                                                                                        |<doc://com.apple.documentation/documentation/AppKit/NSColor/currentControlTint>                        |
|Unavailable control text color                |The text of a control that’s unavailable.                                                                                               |<doc://com.apple.documentation/documentation/AppKit/NSColor/disabledControlTextColor>                  |
|Find highlight color                          |The color of a find indicator.                                                                                                          |<doc://com.apple.documentation/documentation/AppKit/NSColor/findHighlightColor>                        |
|Grid color                                    |The gridlines of an interface element, such as a table.                                                                                 |<doc://com.apple.documentation/documentation/AppKit/NSColor/gridColor>                                 |
|Header text color                             |The text of a header cell in a table.                                                                                                   |<doc://com.apple.documentation/documentation/AppKit/NSColor/headerTextColor>                           |
|Highlight color                               |The virtual light source onscreen.                                                                                                      |<doc://com.apple.documentation/documentation/AppKit/NSColor/highlightColor>                            |
|Keyboard focus indicator color                |The ring that appears around the currently focused control when using the keyboard for interface navigation.                            |<doc://com.apple.documentation/documentation/AppKit/NSColor/keyboardFocusIndicatorColor>               |
|Label color                                   |The text of a label containing primary content.                                                                                         |<doc://com.apple.documentation/documentation/AppKit/NSColor/labelColor>                                |
|Link color                                    |A link to other content.                                                                                                                |<doc://com.apple.documentation/documentation/AppKit/NSColor/linkColor>                                 |
|Placeholder text color                        |A placeholder string in a control or text view.                                                                                         |<doc://com.apple.documentation/documentation/AppKit/NSColor/placeholderTextColor>                      |
|Quaternary label color                        |The text of a label of lesser importance than a tertiary label, such as watermark text.                                                 |<doc://com.apple.documentation/documentation/AppKit/NSColor/quaternaryLabelColor>                      |
|Secondary label color                         |The text of a label of lesser importance than a primary label, such as a label used to represent a subheading or additional information.|<doc://com.apple.documentation/documentation/AppKit/NSColor/secondaryLabelColor>                       |
|Selected content background color             |The background for selected content in a key window or view.                                                                            |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedContentBackgroundColor>            |
|Selected control color                        |The surface of a selected control.                                                                                                      |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedControlColor>                      |
|Selected control text color                   |The text of a selected control.                                                                                                         |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedControlTextColor>                  |
|Selected menu item text color                 |The text of a selected menu.                                                                                                            |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedMenuItemTextColor>                 |
|Selected text background color                |The background of selected text.                                                                                                        |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedTextBackgroundColor>               |
|Selected text color                           |The color for selected text.                                                                                                            |<doc://com.apple.documentation/documentation/AppKit/NSColor/selectedTextColor>                         |
|Separator color                               |A separator between different sections of content.                                                                                      |<doc://com.apple.documentation/documentation/AppKit/NSColor/separatorColor>                            |
|Shadow color                                  |The virtual shadow cast by a raised object onscreen.                                                                                    |<doc://com.apple.documentation/documentation/AppKit/NSColor/shadowColor>                               |
|Tertiary label color                          |The text of a label of lesser importance than a secondary label.                                                                        |<doc://com.apple.documentation/documentation/AppKit/NSColor/tertiaryLabelColor>                        |
|Text background color                         |The background color behind text.                                                                                                       |<doc://com.apple.documentation/documentation/AppKit/NSColor/textBackgroundColor>                       |
|Text color                                    |The text in a document.                                                                                                                 |<doc://com.apple.documentation/documentation/AppKit/NSColor/textColor>                                 |
|Under page background color                   |The background behind a document’s content.                                                                                             |<doc://com.apple.documentation/documentation/AppKit/NSColor/underPageBackgroundColor>                  |
|Unemphasized selected content background color|The selected content in a non-key window or view.                                                                                       |<doc://com.apple.documentation/documentation/AppKit/NSColor/unemphasizedSelectedContentBackgroundColor>|
|Unemphasized selected text background color   |A background for selected text in a non-key window or view.                                                                             |<doc://com.apple.documentation/documentation/AppKit/NSColor/unemphasizedSelectedTextBackgroundColor>   |
|Unemphasized selected text color              |Selected text in a non-key window or view.                                                                                              |<doc://com.apple.documentation/documentation/AppKit/NSColor/unemphasizedSelectedTextColor>             |
|Window background color                       |The background of a window.                                                                                                             |<doc://com.apple.documentation/documentation/AppKit/NSColor/windowBackgroundColor>                     |
|Window frame text color                       |The text in the window’s title bar area.                                                                                                |<doc://com.apple.documentation/documentation/AppKit/NSColor/windowFrameTextColor>                      |

#### App accent colors

Beginning in macOS 11, you can specify an *accent color* to customize the appearance of your app’s buttons, selection highlighting, and sidebar icons. The system applies your accent color when the current value in General > Accent color settings is *multicolor*.

If people set their accent color setting to a value other than multicolor, the system applies their chosen color to the relevant items throughout your app, replacing your accent color. The exception is a sidebar icon that uses a fixed color you specify. Because a fixed-color sidebar icon uses a specific color to provide meaning, the system doesn’t override its color when people change the value of accent color settings. For guidance, see [Sidebars](/design/Human-Interface-Guidelines/sidebars).

### tvOS

**Consider choosing a limited color palette that coordinates with your app logo.** Subtle use of color can help you communicate your brand while deferring to the content.

**Avoid using only color to indicate focus.** Subtle scaling and responsive animation are the primary ways to denote interactivity when an element is in focus.

### visionOS

**Use color sparingly, especially on glass.** Standard visionOS windows typically use the system-defined glass [material](/design/Human-Interface-Guidelines/materials), which lets light and objects from people’s physical surroundings and their space show through. Because the colors in these physical and virtual objects are visible through the glass, they can affect the legibility of colorful app content in the window. Prefer using color in places where it can help call attention to important information or show the relationship between parts of the interface.

**Prefer using color in bold text and large areas.** Color in lightweight text or small areas can make them harder to see and understand.

**In a fully immersive experience, help people maintain visual comfort by keeping brightness levels balanced.** Although using high contrast can help direct people’s attention to important content, it can also cause visual discomfort if people’s eyes have adjusted to low light or darkness. Consider making content fully bright only when the rest of the visual context is also bright. For example, avoid displaying a bright object on a very dark or black background, especially if the object flashes or moves.

### watchOS

**Use background color to support existing content or supply additional information.** Background color can establish a sense of place and help people recognize key content. For example, in Activity, each infographic view for the Move, Exercise, and Stand Activity rings has a background that matches the color of the ring. Use background color when you have something to communicate, rather than as a solely visual flourish. Avoid using full-screen background color in views that are likely to remain onscreen for long periods of time, such as in a workout or audio-playing app.

**Recognize that people might prefer graphic complications to use tinted mode instead of full color.** The system can use a single color that’s based on the wearer’s selected color in a graphic complication’s images, gauges, and text. For guidance, see [Complications](/design/Human-Interface-Guidelines/complications).