+++
date = '2025-11-12'
title = 'setting up a new mac'
description = "tools of the trade or a guide on setting up a new workspace"
tags = ["devlog"]
+++

tools
- ghostty
- zed
- helium
- obsidian
- hammerspoon[1]
- sublime merge


appendix
[1] hammerspoon config
```
-- ~/.hammerspoon/init.lua

-- 6-zone layout for vertically stacked monitors

-- ⌃⌥ (Ctrl+Opt) = current screen snapping

-- ⌃⇧ (Ctrl+Shift) = top monitor snap

-- ⌃⌘ (Ctrl+Cmd) = bottom monitor snap

-- ⌃⌥ ↑ / ↓ = move vertically (preserve left/right/full)

  

hs.window.animationDuration = 0

  

--------------------------------------------------

-- Screen Helpers

--------------------------------------------------

  

local function getScreens()

local screens = hs.screen.allScreens()

  

if #screens < 2 then

hs.alert.show("Only 1 display detected")

return screens[1], screens[1]

end

  

table.sort(screens, function(a, b)

return a:frame().y < b:frame().y

end)

  

return screens[1], screens[2] -- top, bottom

end

  

--------------------------------------------------

-- Zones

--------------------------------------------------

  

local left = { x = 0, y = 0, w = 0.5, h = 1 }

local right = { x = 0.5, y = 0, w = 0.5, h = 1 }

local full = { x = 0, y = 0, w = 1, h = 1 }

  

--------------------------------------------------

-- Move To Specific Screen

--------------------------------------------------

  

local function moveTo(screen, rect)

local f = screen:frame()

  

return {

x = f.x + (f.w * rect.x),

y = f.y + (f.h * rect.y),

w = f.w * rect.w,

h = f.h * rect.h,

}

end

  

local function applyRect(win, screen, rect)

win:move(moveTo(screen, rect))

end

  

--------------------------------------------------

-- Horizontal Snap

--------------------------------------------------

  

local function moveCurrent(rect)

return function()

local win = hs.window.focusedWindow()

if not win then return end

applyRect(win, win:screen(), rect)

end

end

  

local function moveToScreen(screenPicker, rect)

return function()

local win = hs.window.focusedWindow()

if not win then return end

  

local top, bottom = getScreens()

local screen = (screenPicker == "top") and top or bottom

applyRect(win, screen, rect)

end

end

  

--------------------------------------------------

-- Detect Window Side (left/right/full)

--------------------------------------------------

  

local function detectZone(win)

local screen = win:screen()

local f = screen:frame()

local wf = win:frame()

  

local relX = (wf.x - f.x) / f.w

local relW = wf.w / f.w

  

if relW > 0.9 then

return "full"

elseif relX < 0.25 then

return "left"

else

return "right"

end

end

  

--------------------------------------------------

-- Vertical Toggle (Preserve Side)

--------------------------------------------------

  

local function moveVertical()

local win = hs.window.focusedWindow()

if not win then return end

  

local top, bottom = getScreens()

local currentScreen = win:screen()

local zone = detectZone(win)

  

local target = (currentScreen:id() == top:id()) and bottom or top

local rect = (zone == "left" and left)

or (zone == "right" and right)

or full

  

applyRect(win, target, rect)

end

  

--------------------------------------------------

-- Key Bindings

--------------------------------------------------

  

-- ⌃⌥ (Current screen)

hs.hotkey.bind({ "ctrl", "alt" }, "left", moveCurrent(left))

hs.hotkey.bind({ "ctrl", "alt" }, "right", moveCurrent(right))

hs.hotkey.bind({ "ctrl", "alt" }, "return", moveCurrent(full))

  

-- ⌃⇧ (Top monitor)

hs.hotkey.bind({ "ctrl", "shift" }, "left", moveToScreen("top", left))

hs.hotkey.bind({ "ctrl", "shift" }, "right", moveToScreen("top", right))

hs.hotkey.bind({ "ctrl", "shift" }, "return", moveToScreen("top", full))

  

-- ⌃⌘ (Bottom monitor)

hs.hotkey.bind({ "ctrl", "cmd" }, "left", moveToScreen("bottom", left))

hs.hotkey.bind({ "ctrl", "cmd" }, "right", moveToScreen("bottom", right))

hs.hotkey.bind({ "ctrl", "cmd" }, "return", moveToScreen("bottom", full))

  

-- ⌃⌥ ↑ / ↓ (Vertical toggle)

hs.hotkey.bind({ "ctrl", "alt" }, "up", moveVertical)

hs.hotkey.bind({ "ctrl", "alt" }, "down", moveVertical)

  

hs.alert.show("🔲 6-Zone Vertical Layout Loaded")
```
