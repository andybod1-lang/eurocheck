//
//  AppDelegate.swift
//  EuroCheck
//
//  Safari Web Extension container app for EuroCheck
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // App launched
    }
    
    func applicationWillTerminate(_ aNotification: Notification) {
        // App terminating
    }
    
    func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        return true
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
