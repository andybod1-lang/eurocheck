//
//  SafariWebExtensionHandler.swift
//  EuroCheck Extension
//
//  Handles native messaging between Safari and the web extension
//

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    
    private let logger = Logger(subsystem: "com.eurocheck.EuroCheck.Extension", category: "handler")
    
    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem
        
        let profile: UUID?
        if #available(macOS 13.0, *) {
            profile = request?.userInfo?[SFExtensionProfileKey] as? UUID
        } else {
            profile = request?.userInfo?["profile"] as? UUID
        }
        
        let message: Any?
        if #available(macOS 13.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }
        
        logger.log("Received message from browser.runtime.sendNativeMessage: \(String(describing: message), privacy: .public)")
        
        // Process the message and prepare response
        let response = processMessage(message)
        
        let responseItem = NSExtensionItem()
        if #available(macOS 13.0, *) {
            responseItem.userInfo = [SFExtensionMessageKey: response]
        } else {
            responseItem.userInfo = ["message": response]
        }
        
        context.completeRequest(returningItems: [responseItem], completionHandler: nil)
    }
    
    private func processMessage(_ message: Any?) -> [String: Any] {
        // Handle native messaging from the extension
        // Currently EuroCheck doesn't use native messaging, but this is here for future use
        
        guard let messageDict = message as? [String: Any] else {
            return ["error": "Invalid message format", "success": false]
        }
        
        if let action = messageDict["action"] as? String {
            switch action {
            case "ping":
                return ["success": true, "response": "pong", "version": "0.1.0"]
            case "getSystemInfo":
                return [
                    "success": true,
                    "platform": "macOS",
                    "extensionType": "safari"
                ]
            default:
                return ["error": "Unknown action: \(action)", "success": false]
            }
        }
        
        return ["error": "No action specified", "success": false]
    }
}
