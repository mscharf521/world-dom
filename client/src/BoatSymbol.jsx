import React from 'react'
import "./BoatSymbol.css"

export default function BoatSymbol(props) {
    return <div className="boat_sym">
        {
            <svg viewBox="0 0 230 120" stroke={props.color} fill={props.css_color} strokeWidth="1">
                <g fill={props.css_color}> 
                    <path d={boat_path}></path>
                </g>
            </svg>}


    </div>
    }

export const boat_path = "M187.1132 62.602h8.221V58.9103l-5.3368.5914c-1.4946.1653-2.8403-.9118-3.006-2.4064l-.0445-.4039c-.1657-1.4942.9115-2.84 2.406-3.0056l5.9813-.6626V50.76c0-1.5035 1.2194-2.7225 2.7225-2.7225h4.29c1.5038 0 2.7225 1.219 2.7225 2.7225v1.1844l13.6389-1.5111c1.4946-.1653 2.8403.9118 3.006 2.4064l.0445.4039c.1657 1.4942-.9115 2.84-2.406 3.0056l-14.2834 1.5824v4.7705h6.0218c2.6136 0 4.7322 2.1186 4.7322 4.7289v10.8636c-8.4846-1.5807-20.0412-3.6795-33.4422-5.9664v-4.8972c0-2.6103 2.1186-4.7289 4.7322-4.7289Zm-18.0282-25.8159c-.8577 0-1.554.6963-1.554 1.5543v2.5014c0 .858.696 1.5543 1.554 1.5543h5.7951v6.4251H169.085c-.858 0-1.554.6963-1.554 1.5543v2.5014c0 .858.696 1.5543 1.554 1.5543h5.7951v6.8145H169.085c-.858 0-1.554.693-1.554 1.551v2.5047c0 .858.696 1.5543 1.554 1.5543h5.7951v4.1052c-6.2763-1.0494-12.8733-2.1219-19.6878-3.1944V19.8934c0-1.6863 1.3665-3.0525 3.0525-3.0525h2.805c1.686 0 3.0525 1.3662 3.0525 3.0525v6.9432h7.7253c1.686 0 3.0525 1.3662 3.0525 3.0525v6.897H169.085ZM80.7147 3.1195c1.5038 0 2.7225 1.219 2.7225 2.7228v2.2631l5.9813.6626c1.4946.1653 2.5717 1.5111 2.406 3.0056l-.0445.4039c-.1657 1.4942-1.5114 2.5717-3.006 2.406l-5.3368-.5914v7.6534h6.9366c1.2735 0 2.3034 1.0296 2.3034 2.3001v9.6162H61.0694l2.1153-10.0881c.2244-1.0659 1.1652-1.8282 2.2539-1.8282h8.2635V12.9136l-14.2834-1.5827c-1.4946-.1653-2.5717-1.5111-2.406-3.0056l.0445-.4039c.1657-1.4942 1.5114-2.5717 3.006-2.406l13.6389 1.5111v-1.1844c0-1.5035 1.2187-2.7225 2.7225-2.7225h4.29Zm-45.8957 40.5867-5.3368-.5914v5.7922h3.2175c1.5045 0 2.7225 1.2177 2.7225 2.7225v3.6168h-.6966c-1.8345 0-3.5805.0198-5.2434.0594-1.3167.033-2.5806.0759-3.795.1287-2.1321.0957-4.1088.2244-5.94.3828v-13.7808l-14.2834-1.5827c-1.4946-.1653-2.5717-1.5111-2.406-3.0056l.0445-.4039c.1657-1.4942 1.5114-2.5717 3.006-2.406l13.6389 1.5111v-1.1844c0-1.5048 1.2174-2.7225 2.7225-2.7225h4.29c1.5045 0 2.7225 1.2177 2.7225 2.7225v2.2631l5.9813.6626c1.4946.1653 2.5717 1.5111 2.406 3.0056l-.0445.4039c-.1657 1.4942-1.5114 2.5717-3.006 2.406Zm85.0011-3.3792c1.6853 0 3.0525 1.3665 3.0525 3.0525v8.6625h6.27v-3.3825c0-1.686 1.3665-3.0525 3.0525-3.0525h8.085c1.6853 0 3.0525 1.3665 3.0525 3.0525v3.3825h3.135c2.277 0 4.125 1.848 4.125 4.125v10.8834c-13.8336-2.1384-28.4295-4.2372-42.9-6.0588v-8.9496h6.27v-8.6625c0-1.686 1.3665-3.0525 3.0525-3.0525h2.805Zm-70.5642 2.1219c.399-1.9074 2.0859-3.2769 4.0359-3.2769h44.6655c2.277 0 4.125 1.848 4.125 4.125v17.0049c-19.7238-2.3859-38.9991-4.1943-55.5591-4.818l2.7327-13.035Zm173.3688 70.0326c-.7161 2.6004-3.0822 4.3989-5.7783 4.3989H25.8155c-2.3852 0-4.5405-1.4124-5.4938-3.597l-10.9956-25.2351c5.5404-1.5576 14.0808-2.3463 25.4034-2.3463 57.0732 0 166.0197 20.2554 188.5085 24.5553l-.6135 2.2242ZM.2372 67.1857c21.9618-21.7074 229.5256 19.3842 229.5252 19.3842l-5.0292 18.2622c-29.466-5.6463-179.7378-33.5049-217.6647-21.9681l-6.8313-15.6783Z";
// export const boat_path = "M152.234,521.775l20.701,47.51c114.93-34.96,570.299,49.46,659.59,66.57l15.24-55.34 C847.766,580.515,218.785,455.995,152.234,521.775z M826.135,659.035l1.859-6.74c-68.148-13.03-398.289-74.41-571.238-74.41 c-34.311,0-60.191,2.39-76.98,7.11l33.32,76.47c2.889,6.62,9.42,10.9,16.648,10.9h578.881 C816.795,672.365,823.965,666.915,826.135,659.035z M300.775,446.815l-8.281,39.5c50.182,1.89,108.592,7.37,168.361,14.6v-51.53 c0-6.9-5.6-12.5-12.5-12.5h-135.35C307.096,436.885,301.984,441.035,300.775,446.815z M514.606,440.385h-8.5c-5.109,0-9.25,4.141-9.25,9.25v26.25h-19v27.12 c43.85,5.52,88.08,11.88,130,18.36v-32.98c0-6.9-5.6-12.5-12.5-12.5h-9.5v-10.25c0-5.109-4.143-9.25-9.25-9.25h-24.5 c-5.109,0-9.25,4.141-9.25,9.25v10.25h-19v-26.25C523.856,444.526,519.713,440.385,514.606,440.385z M257.027,450.625c4.529,0.502,8.607-2.763,9.109-7.291l0.135-1.224 c0.502-4.529-2.762-8.607-7.291-9.108l-18.125-2.008v-6.858c0-4.56-3.691-8.25-8.25-8.25h-13c-4.561,0-8.25,3.69-8.25,8.25v3.589 l-41.33-4.579c-4.529-0.502-8.607,2.763-9.109,7.291l-0.135,1.224c-0.502,4.529,2.762,8.607,7.291,9.108l43.283,4.796v41.76 c5.549-0.48,11.539-0.87,18-1.16c3.68-0.16,7.51-0.29,11.5-0.39c5.039-0.12,10.33-0.18,15.889-0.18h2.111v-10.96 c0-4.56-3.691-8.25-8.25-8.25h-9.75v-17.552L257.027,450.625z M396.105,327.635h-13c-4.557,0-8.25,3.694-8.25,8.25v3.589l-41.33-4.579 c-4.529-0.502-8.607,2.763-9.109,7.291l-0.135,1.224c-0.502,4.529,2.762,8.607,7.291,9.108l43.283,4.796v26.461h-25.041 c-3.299,0-6.15,2.31-6.83,5.54l-6.41,30.57h95.781v-29.14c0-3.85-3.121-6.97-6.98-6.97h-21.02v-23.192l16.172,1.792 c4.529,0.502,8.607-2.763,9.109-7.291l0.135-1.224c0.502-4.529-2.762-8.607-7.291-9.108l-18.125-2.008v-6.858 C404.355,331.329,400.662,327.635,396.105,327.635z M663.894,429.655h17.561v-20.9c0-5.11-4.141-9.25-9.25-9.25h-23.41v-21.04 c0-5.11-4.141-9.25-9.25-9.25h-8.5c-5.109,0-9.25,4.14-9.25,9.25v145.07c20.65,3.25,40.641,6.5,59.66,9.68v-12.44h-17.561 c-2.6,0-4.709-2.11-4.709-4.71v-7.59c0-2.6,2.109-4.7,4.709-4.7h17.561v-20.65h-17.561c-2.6,0-4.709-2.11-4.709-4.71v-7.58 c0-2.6,2.109-4.71,4.709-4.71h17.561v-19.47h-17.561c-2.6,0-4.709-2.11-4.709-4.71v-7.58 C659.185,431.765,661.295,429.655,663.894,429.655z M718.525,507.885c-7.92,0-14.34,6.42-14.34,14.33v14.84c40.609,6.93,75.629,13.29,101.34,18.08 v-32.92c0-7.91-6.42-14.33-14.34-14.33h-18.248v-14.456l43.283-4.795c4.529-0.502,7.793-4.58,7.291-9.108l-0.135-1.224 c-0.502-4.529-4.58-7.793-9.109-7.292l-41.33,4.579V472c0-4.556-3.693-8.25-8.25-8.25h-13c-4.555,0-8.25,3.694-8.25,8.25v6.858 l-18.125,2.008c-4.529,0.502-7.793,4.58-7.291,9.108l0.135,1.224c0.502,4.529,4.58,7.793,9.109,7.292l16.172-1.792v11.187H718.525z";