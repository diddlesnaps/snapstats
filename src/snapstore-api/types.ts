export interface SnapApiSnap {
    package_name: string
    revision: number
    architecture: string[]
    base: string
    channel: string
    sections: string[]
}