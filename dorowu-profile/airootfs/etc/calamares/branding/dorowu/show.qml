import QtQuick 2.15
import QtQuick.Controls 2.15

Rectangle {
    id: presentation
    color: "#0f172a"
    anchors.fill: parent

    Column {
        anchors.centerIn: parent
        spacing: 18

        Image {
            source: "welcome.png"
            width: 240
            height: 240
            fillMode: Image.PreserveAspectFit
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "Welcome to Dorowu OS"
            color: "#ffffff"
            font.pixelSize: 22
            font.bold: true
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "A clean, modern Arch-based system with full developer tooling & App Store."
            color: "#94a3b8"
            font.pixelSize: 14
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }
}
