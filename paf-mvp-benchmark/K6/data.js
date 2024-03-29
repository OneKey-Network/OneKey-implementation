export const unsignedPrefsMock = {
    identifiers: [
        {
            version: "0.1",
            type: "paf_browser_id",
            value: "6c26cf1c-1930-425a-aff7-ebeca2ff02f7",
            source: {
                domain: "crto-poc-1.onekey.network",
                timestamp: 1659509062,
                signature: "NZDDcBXgmIVpw8EqHgMjQRjYUi/YoXzxKa9eWqiGOeZ9SxEflAhuIiUkbZ8SUGtOPtcj3Vnk7vfweZIv89KjyQ=="
            },
            persisted: true
        }
    ],
    unsignedPreferences: {
        data: {
            use_browsing_for_personalization: true
        },
        version: null
    }
}

export const signedPrefsMock = {
    identifiers: [
        {
            version: "0.1",
            type: "paf_browser_id",
            value: "6c26cf1c-1930-425a-aff7-ebeca2ff02f7",
            source: {
                domain: "crto-poc-1.onekey.network",
                timestamp: 1659509062,
                signature: "NZDDcBXgmIVpw8EqHgMjQRjYUi/YoXzxKa9eWqiGOeZ9SxEflAhuIiUkbZ8SUGtOPtcj3Vnk7vfweZIv89KjyQ=="
            },
            "persisted": true
        }
    ],
    preferences: {
        version: "0.1",
        data: {
            use_browsing_for_personalization: true
        },
        source: {
            domain: "cmp.pafdemopublisher.com",
            timestamp: 1659509141,
            signature: "6hTCYNppkmBttFk71SKqbhhos71ngFp1r2fS7SfyeUfULJxC+H2S7kLHdoJdyEhCBTv6T1Y1SzRkMBuO50QypQ=="
        }
    }
}

export const writeMessageMock = {
    body: {
        identifiers: [
            {
                version: "0.1",
                type: "paf_browser_id",
                value: "6c26cf1c-1930-425a-aff7-ebeca2ff02f7",
                source: {
                    domain: "crto-poc-1.onekey.network",
                    timestamp: 1659509062,
                    signature: "NZDDcBXgmIVpw8EqHgMjQRjYUi/YoXzxKa9eWqiGOeZ9SxEflAhuIiUkbZ8SUGtOPtcj3Vnk7vfweZIv89KjyQ=="
                },
                persisted: true
            }
        ],
        preferences: {
            version: "0.1",
            data: {
                use_browsing_for_personalization: false
            },
            source: {
                domain: "cmp.pafdemopublisher.com",
                timestamp: 1659530790,
                signature: "Tirc9AKq4B4sLF/LPg1d/PUJhuRfliTDmPG3Ab6+SebD7lPTERKERK4/sXA14i5ha2KWQi02zNlwCcrn2Fkutw=="
            }
        }
    },
    sender: "cmp.pafdemopublisher.com",
    receiver: "crto-poc-1.onekey.network",
    timestamp: 1659530790,
    signature: "MWXwTWY4jvBD7BJAiiRA3/2eRyQRQITVen7LZCIMlxi2tupM4YmeSF7bdkjX957h36atiQd5uTFw82zYrkes1A=="
}