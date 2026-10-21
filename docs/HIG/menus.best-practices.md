# Menus

_(fuente: HIG · menus)_

### Platform considerations
*No additional considerations for macOS, tvOS, or watchOS.*

### iOS, iPadOS

In iOS and iPadOS, a menu can display items in one of the following three layouts.

- **Small.** A row of four items appears at the top of the menu, above a list that contains the remaining items. For each item in the top row, the menu displays a symbol or icon, but no label.
- **Medium.** A row of three items appears at the top of the menu, above a list that contains the remaining items. For each item in the top row, the menu displays a symbol or icon above a short label.
- **Large (the default).** The menu displays all items in a list.

For developer guidance, see <doc://com.apple.documentation/documentation/UIKit/UIMenu/preferredElementSize>.

**Choose a small or medium menu layout when it can help streamline people’s choices.** Consider using the medium layout if your app has three important actions that people often want to perform. For example, Notes uses the medium layout to give people a quick way to perform the Scan, Lock, and Pin actions. Use the small layout only for closely related actions that typically appear as a group, such as Bold, Italic, Underline, and Strikethrough. For each action, use a recognizable symbol that helps people identify the action without a label.

### visionOS

In visionOS, a menu can display items using the small or large layout styles that iOS and iPadOS define (for guidance, see [iOS, iPadOS](/design/Human-Interface-Guidelines/menus#iOS-iPadOS)). You can present a menu in your app or game from 3D content using a SwiftUI view. To ensure that your menu is always visible to people, even when other content occludes it, you can apply a [breakthrough effect](https://developer.apple.com/documentation/swiftui/view/presentationbreakthrougheffect(_:)). As in macOS, an open menu in a visionOS window can appear outside of the window’s boundaries.

**Prefer displaying a menu near the content it controls.** Because people need to look at a menu item before tapping it, they might miss the item’s effect if the content it controls is too far away.

**Prefer the subtle breakthrough effect in most cases.** This effect blends the presentation with its surrounding content, to maintain legibility and usability while preserving the depth and context of the scene. When you select <doc://com.apple.documentation/documentation/SwiftUI/BreakthroughEffect/automatic> for the breakthrough effect of a menu that overlaps with 3D content, the system applies <doc://com.apple.documentation/documentation/SwiftUI/BreakthroughEffect/subtle> by default. You can use <doc://com.apple.documentation/documentation/SwiftUI/BreakthroughEffect/prominent> if it’s important to display a menu prominently over the entire scene in your app or game, but this can disrupt the experience for people and potentially cause discomfort. Alternatively, you can use <doc://com.apple.documentation/documentation/SwiftUI/BreakthroughEffect/none> to fully occlude your menu behind other 3D content — for example, in a puzzle game that requires people to navigate around barriers — but this may make it difficult for people to see and access the menu.