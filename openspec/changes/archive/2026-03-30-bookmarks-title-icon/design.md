## Context

The Bookmarks screen currently renders `<AppHeader title='Bookmarks' />` in 4 return paths. `AppHeader` accepts `title: string | React.ReactNode`, so passing a JSX element is already supported. The drawer already uses `Ionicons name='bookmark'` for this screen's icon.

## Goals / Non-Goals

**Goals:**
- Add an Ionicons `bookmark` icon inline with the "Bookmarks" header title text
- Use `theme.TEXT_PRIMARY` for the icon color to match the title text

**Non-Goals:**
- Adding icons to other screen headers
- Modifying the `AppHeader` component itself

## Decisions

**Inline JSX title over modifying AppHeader:**
`AppHeader` already supports `React.ReactNode` as title. Passing a `<View>` with icon + text avoids any component changes. This is the same approach other screens would use if they needed icons.

**Ionicons `bookmark` over other icon sets:**
The drawer already uses `Ionicons name='bookmark'` for this screen. Reusing the same icon family and name keeps visual consistency.

**Icon size 18 with `marginRight: 6`:**
Size 18 sits well with the 16px title font. A small right margin separates icon from text without excessive spacing.

## Risks / Trade-offs

- [Minimal risk] Four `AppHeader` call sites in BookmarksList need identical updates — extract a shared title element to a `const` to avoid duplication.
