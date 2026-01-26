//
//  ViewController.swift
//  EuroCheck
//
//  Safari Web Extension container app for EuroCheck
//

import Cocoa
import SafariServices

class ViewController: NSViewController {
    
    // EU Color scheme
    private let euBlue = NSColor(red: 0.0, green: 0.2, blue: 0.6, alpha: 1.0)  // #003399
    private let euYellow = NSColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0)  // #FFCC00
    
    private var statusLabel: NSTextField!
    private var descriptionLabel: NSTextField!
    private var openSafariButton: NSButton!
    private var euroStarsView: NSView!
    
    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 480, height: 320))
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        checkExtensionState()
    }
    
    private func setupUI() {
        view.wantsLayer = true
        view.layer?.backgroundColor = euBlue.cgColor
        
        // Euro stars decoration (simplified)
        euroStarsView = NSView(frame: NSRect(x: 0, y: 220, width: 480, height: 80))
        euroStarsView.wantsLayer = true
        view.addSubview(euroStarsView)
        addEuroStars()
        
        // Main icon/emoji
        let iconLabel = NSTextField(labelWithString: "🇪🇺")
        iconLabel.font = NSFont.systemFont(ofSize: 64)
        iconLabel.alignment = .center
        iconLabel.frame = NSRect(x: 0, y: 160, width: 480, height: 80)
        view.addSubview(iconLabel)
        
        // Status label
        statusLabel = NSTextField(labelWithString: "EuroCheck is installed")
        statusLabel.font = NSFont.boldSystemFont(ofSize: 24)
        statusLabel.textColor = euYellow
        statusLabel.alignment = .center
        statusLabel.isBezeled = false
        statusLabel.drawsBackground = false
        statusLabel.isEditable = false
        statusLabel.isSelectable = false
        statusLabel.frame = NSRect(x: 20, y: 110, width: 440, height: 40)
        view.addSubview(statusLabel)
        
        // Description label
        descriptionLabel = NSTextField(labelWithString: "Verify EU IBAN accounts and check company registry data")
        descriptionLabel.font = NSFont.systemFont(ofSize: 14)
        descriptionLabel.textColor = NSColor.white.withAlphaComponent(0.9)
        descriptionLabel.alignment = .center
        descriptionLabel.isBezeled = false
        descriptionLabel.drawsBackground = false
        descriptionLabel.isEditable = false
        descriptionLabel.isSelectable = false
        descriptionLabel.frame = NSRect(x: 20, y: 80, width: 440, height: 25)
        view.addSubview(descriptionLabel)
        
        // Open Safari Extensions button
        openSafariButton = NSButton(title: "Open Safari Extensions Preferences", target: self, action: #selector(openSafariExtensionPreferences))
        openSafariButton.bezelStyle = .rounded
        openSafariButton.font = NSFont.systemFont(ofSize: 14, weight: .medium)
        openSafariButton.frame = NSRect(x: 115, y: 25, width: 250, height: 40)
        openSafariButton.wantsLayer = true
        openSafariButton.layer?.backgroundColor = euYellow.cgColor
        openSafariButton.layer?.cornerRadius = 8
        openSafariButton.contentTintColor = euBlue
        view.addSubview(openSafariButton)
    }
    
    private func addEuroStars() {
        // Add 12 stars in a circle pattern (EU flag style)
        let centerX: CGFloat = 240
        let centerY: CGFloat = 40
        let radius: CGFloat = 30
        
        for i in 0..<12 {
            let angle = (CGFloat(i) * 30.0 - 90.0) * .pi / 180.0
            let x = centerX + radius * cos(angle) - 6
            let y = centerY + radius * sin(angle) - 6
            
            let star = NSTextField(labelWithString: "★")
            star.font = NSFont.systemFont(ofSize: 12)
            star.textColor = euYellow
            star.frame = NSRect(x: x, y: y, width: 12, height: 12)
            star.isBezeled = false
            star.drawsBackground = false
            euroStarsView.addSubview(star)
        }
    }
    
    private func checkExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: "com.eurocheck.EuroCheck.Extension") { state, error in
            DispatchQueue.main.async {
                if let error = error {
                    self.statusLabel.stringValue = "Error checking extension"
                    self.descriptionLabel.stringValue = error.localizedDescription
                    return
                }
                
                if let state = state {
                    if state.isEnabled {
                        self.statusLabel.stringValue = "✓ EuroCheck is enabled"
                        self.descriptionLabel.stringValue = "The extension is active in Safari"
                    } else {
                        self.statusLabel.stringValue = "EuroCheck is installed"
                        self.descriptionLabel.stringValue = "Enable the extension in Safari preferences"
                    }
                }
            }
        }
    }
    
    @objc private func openSafariExtensionPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.eurocheck.EuroCheck.Extension") { error in
            if let error = error {
                DispatchQueue.main.async {
                    let alert = NSAlert()
                    alert.messageText = "Could not open Safari preferences"
                    alert.informativeText = error.localizedDescription
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    alert.runModal()
                }
            }
        }
    }
}
