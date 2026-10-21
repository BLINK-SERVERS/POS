# Layout

_(fuente: HIG · layout)_

### Platform considerations
*No additional considerations for iOS or iPadOS.*

### macOS

**Avoid placing controls or critical information at the bottom of a window.** People often move windows so that the bottom edge is below the bottom of the screen.

**Avoid displaying content behind the camera housing at the top edge of the window.** For developer guidance, see <doc://com.apple.documentation/documentation/BundleResources/Information-Property-List/NSPrefersDisplaySafeAreaCompatibilityMode>.

### tvOS

**Adhere to the screen’s safe area.** Inset primary content 60 points from the top and bottom of the screen, and 80 points from the sides. Providing these margins ensures your content is visible regardless of TV compatibility settings or overscan cropping.

**Include appropriate padding between focusable elements.** When you use UIKit and the focus APIs, an element gets bigger when it comes into focus. Consider how elements look when they’re focused, and make sure you don’t let them overlap important information. For developer guidance, see <doc://com.apple.documentation/documentation/UIKit/about-focus-interactions-for-apple-tv>.

#### Grids

The following grid layouts provide an optimal viewing experience. Be sure to use appropriate spacing between unfocused rows and columns to prevent overlap when an item comes into focus.

If you use the UIKit collection view flow element, the number of columns in a grid is automatically determined based on the width and spacing of your content. For developer guidance, see <doc://com.apple.documentation/documentation/UIKit/UICollectionViewFlowLayout>.

**Two-column:**

#### Two-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |860 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Three-column:**

#### Three-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |560 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Four-column:**

#### Four-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |410 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Five-column:**

#### Five-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |320 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Six-column:**

#### Six-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |260 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Seven-column:**

#### Seven-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |217 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Eight-column:**

#### Eight-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |184 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Nine-column:**

#### Nine-column grid
                
                |Attribute               |Value |
                |------------------------|------|
                |Unfocused content width |160 pt|
                |Horizontal spacing      |40 pt |
                |Minimum vertical spacing|100 pt|

**Include additional vertical spacing for titled rows.** If a row has a title, provide enough spacing between the bottom of the previous unfocused row and the center of the title to avoid crowding. Also provide spacing between the bottom of the title and the top of the unfocused items in the row.

**Use consistent spacing.** When content isn’t consistently spaced, it no longer looks like a grid and it’s harder for people to scan.

**Make partially hidden content look symmetrical.** To help direct attention to the fully visible content, keep partially hidden offscreen content the same width on each side of the screen.

### visionOS

In visionOS, you can lay out content within a window, a bounded 3D volume, or an immersive space. The guidance below focuses on laying out content in a window or volume; for guidance on displaying content spatially and best practices for using depth, scale, and positioning, see [Spatial layout](/design/Human-Interface-Guidelines/spatial-layout). To learn more about windows and volumes in visionOS, see [Windows > visionOS](/design/Human-Interface-Guidelines/windows#visionOS).

**In general, support resizing.** The ability to resize windows and volumes is standard behavior in visionOS, just as in macOS and iPadOS. When you allow resizing, make sure your layout adapts well as it changes size, and prefer to keep content horizontally centered at very large sizes so people can easily view and interact with it.

You can also choose to set a minimum and maximum size for windows, volumes, and attached UI elements like ornaments. Use these settings to keep elements from overlapping at small sizes, and to keep large layouts from becoming too unwieldy; but don’t use minimum and maximum sizes as a way to prevent resizing. For example, in Safari, people can resize browser windows, but the custom navigation bar ornament has a fixed maximum size so that controls remain easy to access. For developer guidance, see <doc://com.apple.documentation/documentation/visionOS/positioning-and-sizing-windows>.

**Use 3D content sparingly in windows.** While windows in visionOS can display 3D content at a fixed depth, reserve this for meaningful moments alongside 2D content. For example, an educational app might display an inline 3D model of a rocket next to information about the model. When displaying 3D content inline, place it inset in the window to avoid it colliding with other content or controls, or appearing unpredictably outside the window edge.

To display larger models or views that primarily consist of 3D content, consider using a volume or placing content in an immersive space.

**Display supplemental content in an adjacent window, not in an ornament.** While [ornaments](/design/Human-Interface-Guidelines/ornaments) are flexible enough to act as custom components, they are best for app-specific interactive controls like toolbars and video playback controls, not supplemental content. To display a supplemental content view, open a new window next to the current one using <doc://com.apple.documentation/documentation/SwiftUI/Scene/defaultWindowPlacement(_:)> instead of placing the content in an ornament. For developer guidance, see <doc://com.apple.documentation/documentation/visionOS/positioning-and-sizing-windows>.

**Include enough space around controls for them to be easy to interact with.** Put enough space around controls to make them clearly identifiable, and to prevent the system-provided hover effect from obscuring other content. For example, place buttons so their centers are at least 60 points apart. For guidance, see [Eyes](/design/Human-Interface-Guidelines/eyes), [Spatial layout](/design/Human-Interface-Guidelines/spatial-layout), and [Buttons > visionOS](/design/Human-Interface-Guidelines/buttons#visionOS).

### watchOS

**Avoid placing more than two or three controls side by side in your interface.** As a general rule, display no more than three buttons that contain glyphs — or two buttons that contain text — in a row. Although it’s usually better to let text buttons span the full width of the screen, two side-by-side buttons with short text labels can also work well, as long as the screen doesn’t scroll.

**Support autorotation in views people might want to show others.** When people flip their wrist away, apps typically respond to the motion by sleeping the display, but in some cases it makes sense to autorotate the content. For example, a wearer might want to show an image to a friend or display a QR code to a reader. For developer guidance, see <doc://com.apple.documentation/documentation/WatchKit/WKExtension/isAutorotating>.