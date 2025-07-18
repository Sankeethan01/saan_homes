import { useState } from "react";
import { RiCloseLine, RiUploadLine } from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import jsPDF from "jspdf";

interface SupervisorInvoiceModalProps {
  open: boolean;
  step: any;
  invoice: any;
  onClose: () => void;
  onSaved?: () => void;
}

// Place your real logo base64 here (replace with your actual logo for production)
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAABrCAYAAADaUHj1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAACWkSURBVHhe7Z15nB1Vmfe/z6m6tzvdSXc6vaaTDlkJhLCDzMAom2xuw6siojgKriBC2JRdcEHxDTgyzguKCA4zyriMyi4qjoJJh5CFJSQhJOyQXtJLOr3dW3We949Tdfv2TXenk9xOQrjffG6nqk7Vqe1XTz1ne0pUVSnwjkFVSafTWGsRkUFp8Xz28uGmh1o2VHrMSGljgRSE/c4jW9wxIjKsSHNFOVLacMsYYflYYHIXFNj7ERESiQTGDNx+Vd3ql52WzUhpewoFYb9DGU7c2WQLfKi0oaaHmo/JfWDGkoKw38FkiztXcEMJdzTrZM/nLosZbnk+KfjYBdDI5w7DcCtfOyZ3+XDTo5mPGW55PihY7AIZy+153pCWNhbgcBY6d/3RsqPbjYaCsAvANsS9M9NDzWczUtrOUHBFCgxCc9ySmNG6IsNNDzWfzUhpO0LBYhcYRK7ljtlZKz7UfDYjpe0IBWEX2IqxFnfuspjhlu8IBWEXGJKxFPdIbM+6I1EQdoFhybe4c+eHY6S00VIQdoERGU7cDCHcbU3nzuem5ZNCrUiBUaFjWFsy3DJGWL4tCha7wKgYznKP5GKMZnqkZTtDQdgFRk2+xT0aMY92vVwKwi6wXeRT3LnsaNpQFIRdYLvJp7hH2iaXkdJyKQi7wA6RT3HnkptHNsMtz6VQK/IOJAhCVr/wKg8/9hwtm4V9Z9Zx2PzJ7Dujkgmlxbmrj4jmsbYkdz43LZeR0gvCfgfR0tLBXxev5vePLmfZqlfpS/lMnjYHr7gECVM01JRy0P41/MNB9Rwwq5pJFaUjiidmJHEP9f9I06OZjxluOQVh7/3096dY+ezLPPCnp/jfxnW80dwLxmDVYqyltmEWXvEEAEQ8BA+xIVXlwtyZFRw+v55D95/M1LpykgkvN/sMI4k7d35b07nzuWnZDJdWEPZeyiuvNvGXv6/hwcdW8uzat0iFBhWLqAFrsaIYVWobZuMVj0cVEBAF8FBRxCgolCZgzrTxHHHAVI6YP5kZDRWUlhTl7jKv4s4VbO58NkOlFYS9F7FlSw+NT73A/Y8uZ9HyV2jbnI6UmgZ81BoEi6JYYZCwY5waBAEUBbGAwYgBDD4hDbXjOGhuFUfMn8wBs2uornQW320/duIeblnMoG0Lwn57EwYha158nUf++jSP/vUZXnq1E6tJJ0oNEQRVnAUGVA1khG1zhK2oEokanAmPZwRjonTjOxGFaSZNKOKAWZUcdVAdB+9fQ31tGb7n5U3co5mPKQh7L2BT22b+umgVDzy6gqXPvEZvEKJ4YAG1TpDuTw6KAhYZQtjDECvEPRmR4BVRQfCwviLWUlIEs6eWccS8Wo6YP5mGyeUUJaOHIM4iD+LOTcsmTisI+21EKpXm6VUv8cAfn+Evi9fyWtNmPEmiGgJhZI0BsZGkhxLADgh7GJRI6KKIeiCCGA9U8Ew/DXUTOHh2JYftX8N+MyupKB+XEfZwQs0VbUaowywfChEpCPvtwBtvbeLPjz/LfX9ayXNrmkiFgkSuhgKKYLCggkqUhuwCYUf7UUBCwESFT3Vtf8Yg6oOmqSzzOGDWJI48sJZ5s2uYUjOBRMLP5DWcuHMFvK35mIKw91B6e/tY8exLPPCHp3is8QWaO/oRfFBFsZGAQLPu69a3eOsl+RJ2Rr8xoqCu0OmmI72LoGimKhFNUTJOmN1QzhHzajh8vzqmT51EcXFiWEHninektJiCsPcgVJUNL2/kT48/y0OPrWL1iy2E6kWuRoBkLPLOkB9hbz9ur6pgjA8iqBWSRplWX8Kh+1Zw5PzJzJlexcTyUtiGgEdKoyDsPYOOzi080biaB/+0ksaVr9PZY1GThtC6ircsszzEPdxOdpOwMyqL3BcDai0iBhEPjEKYZnJFMfNmV3LE/Drmz65hck0ZnufKDrkCHmk+L8K2YeieRN9zF80qqgOvS5Go80p0TttGokLJcPMDuMN3CUMkD16YdaaDT1q3ukgDr9KBRbGtdNu6v7FHixBXAkcrR2vHmQiIMRhArdLb28eaDRt5+M8r+fPjq3n1rU5UjMvL5tySQcewk0THqK6ARXXDTPzisq2uSN7Jzl7ieUVFIVPolUjkFrUpyovHMXefMg6ZV8Ohc6uYO7MG3x/aL8+dz4uwV9zxU1qWLsOfMR2ZMgWprsJOKCOV8CEwECqhsSgWoyFqPIy6i+x8sIEDUtWoDhbnm0X1sMRrRatufdSaSRx0SsMIe7BY4hm3gojb58D/2TcjflDdMhOJ0dlBl4enrtYNYxCTwHiCn+7Fa22nf8MLdL2whidbPO5vLaM/He1f41jVLuOBs8kzsbAxoCE1U2fil5TnXJxdR3yPB6ZjBMEgxqAqeNrL5z88jzM/cMi23ZB81Yo8efX1dDz4ECkL+EmCijLC2loSU6egDfUE9XVo2UQCvwjUw9qQUBTfKqGAiYScjUTmXp1qooW78PpLlgsg2QfhLrlGq2Qfj6KoGIznkRTF9PQSNL1J3wtr6VuzhtRrr0DXFjy1NJbM428l+0UbatabYesblVcyt9ugGlI9dQbJkolZD+aegqJRYVSwGL+E9x5RyZVfPCazRizqXHHnTdiN132D9vseJKUWXy2qirWKVQh9j/SEEvzqGpg6FZk2Ba+unv7KSZAYR9p4oCHWqrvBsY6yRBPPukVRQnwucWLecA+ZSLyveHHWZXKJmWk14BnBWJDuLuyrL9GzZg39a1/AbnwT6e3DGEU8RdXDAE+UzOeJkv2im6IIruk6zyezNdnCJqS6fgbJ0j1R2A5VRVCMl+TEQydy9ZdPyKQNJejMdD6EveTaG2i//0ECdQ0DqlFTrNsBqGJtiFWwxsOOGw9Vk7BTp8A+MzD1tWjFRIKSUqznY61FNSpBK5l+DTHOP4yVP7TvvVOo6yNh8fHil4m4jkOinhOfEYwvJNMhtG2ib8N6+tY8T9/6dWhrKyaVRjxFjBdd8EEXnUXj5vNEyTwwNvO4RqmZqTEhxxWpmjqDZEl57lp7DM4xFTyT5LhDJnDdl08Y1hXJu7CfvPYbtN//AMFIWWWSXGHB2jSBhqgY7LhxaMUk7OR6ktOmIVOmkK6pxJaOJ/SLCAAThlhCBOuqvQDnFOSf+FC9qDVPEcQYrOfjY/H7+ghbN9K/bi19z68i/erLpDo241uLb9y6iOuTMUioSvQ6gsXj5vN4yVz32hxYYxcQCVvfLsJ2eCbBcYeUcW1ksYcVdOye5EPYS665gfYHHiQcKauMGx39jY7FqGBVMTZENSAtBpsch04oR+tr8aY2YKfVY2rqkPET6S8qIiCqdQnDqFQdNwxk7W8IcmQ2NFGh1VchNAb1PZKE0LUFfeMNutc+T/e6tejrb2C6uzBiMZLAM4ZQFBs/bnGhMydv11tOWDzuAB4v2Q9Btl5vTHn7Cvv4Q8u55vzjM2lDCTqe3nXCjhlU6+emJOpMKShxx8rYHQlQrJ9Ax0+A2mr8+qkwYx9SkydD+URssggruPWtIhn/eJCHnLlADBjNQa128Yx4Ap6HH1hMRyepV9fRu/pZetatR5s34vWn8D3PddY3golcorhOI6pxzco4i4Kwt5tcYV993nFbiTibvFrsxqhWZLTCzkxGCnMtsFFdb/Y64oo0Rl0hwtqQUEFMEltaSqqqAm/qFLyGacjkqQRVE0mXFmHx0FAIsAgW37p8VOK+DGCjjkKKwRiD8QQv3Yc0NZFat4HNa9dgN7wInZsgDPGMB0YGRJtVuHSNxvEDM5C+FQVhbzeDhT2Rq887FnIEPdR0foR95dfpePjh0Ql7OxgQSzzvCnWKYKwhVEugASI+WlyETKrETpmCnTYNU1+PVlcSlpagJpFxX4yF0ACeR1IVr6cbfWMjPS+uoWf1GoLXX0G2dGKw+J5BxMcSfXxoZwVYEPZ2ky3s4w4t55rzjsukDSXoeDovwl58xXV0PvJI3oWdIZOtm3C1JLHFjApparFqXaudKH3FCSirROrrkYapSMMUtLoWO6EU6e4l9erL9K5eTf+L60hvfBPTtwVPBLwEHgYrzp5LfE75EF9B2NvNIIt9WDlXffHYrUQ85HQ+hN14xXV0jKWw4xOMxBzXicTLB+Qdt9gpoKiNfHXAJnzCsgmkq8tobWoiaGkhkUpjxCCehxqXT9woEAtwgDyoryDs7SZX2Fd+4T3OIg8n6Gg6TwFzds2dEQER10oXn4uJplWiDu+oKweKq2v2Eh6+79yOkvbNmBdewm9qolgVL5lEEq6nmTuH7Kq3uLEk/hXY3cQ2WEcRlCc/wh5DSx0TS2uQDR2kt2hmoG0oenoHfmoM4vvgxeZ5YNNMVgUd77lkyWxb4s6PsPd0hhPqcMv3dsbeDo0JIrKVgHN/MXkR9p7az6DAEGj0J9Mhx0QOmOb89jyMMUPGCiTzds67K5K7oMCeibtRiusKCjJQ966xNYwFv+ehMOpAmHkRdnamBfZkosKEBCiWMIQgtAQ2wGo4qLZpT0VGGeU1L8LeM5/vdxDqelC6X/xf9E9dkBtVN7IpSIcE6TRFiYDpM8Yxb954aquKKE5KlA5hYLEWNOpspkT9IKIWYI32M/gX7WQsifIfjbjzIuyCxd7dZJsWG3W5dT1vrBXS6YAw7KN0XMi8/ao4/f1H8qXPnsjnzjmW046fzkdOruajp9VzynG1HH7QeBrqfEqLUqjtJwhCggCsFVT9rN4wIUKARt0etjqMMWFgB9sSd14aaBZdehWb//ynMW2g2WkUQOg2IZt6O6OnPy/P9ehR8txAE1/vyImIwpeFYUioaRK+UlFeyvR9qpgzp5Z9plVSUZ7AeIpVQxhGeaggJjoOUcJQ6OkV2tr7aW7tp7m1h7aOFFt6LelQXURWIyCeu4aSQgVETVRbusMntBXxGXomwQmHVXD9he8dnD5crMB8CPvvl1xJ12N/Lgh7W4yFsKNuvzZMo5qmqNijurqcmTOqmDWrnin1Exk/PomIYoMQNOr3KOKsOxYrrodlrCLBjUU1xtWWhNajv8/Q3pmiqa2fpuYttLal6O4OSacUawz4Lg9PBq6pDtV1dzvZlrAZRtx5EXbBYo+S7RB25gWvkukw4KItDdRghGGAoJSWJKifPJ45syczY2YNNbVlFBU5UdpgIFqUG3WEy0PCgeno2gzqxhv1xIk7FhhRjFHAJ7SGVFrp2pKitbWfpuZ+WtsCOrak6UuFWDVgvEyr8HCFUreHgc5lQ1n60QibIcSdH2Fffg2b//hoQdjbYtTCjqyqStS11/1sCBoGeJ5SVl7EPg2VzJ49men7VDNpUhG+76EKYehi+TmyMtd4NjMRLXfiiu9eLDCN/gwcX1RoxNWuGBPF4UNI9Rs2d4dsau+jubWXlk09tHWG9PZZQjUoHsZ4GHH7ElzMFCfu6BGKdJ57yMTCPryC678ytLDJFXc+hL34q9fS+egfnLDd23GIZ283s8cJ2w3mjTSSSSYSlqqrZbA2JLSWZFKorixi+vRaZs+pZ+qUSiaUJfBNgA2UMDKtGoW02DW4I1Y1iAnxjPO/LZ7z07stbe0pmjb109TaTUdnii29SjrwQQ2eJ4hRF7INBhSdI2wFEpLg2EMn8o0FJw0kDkEs7vwI+2vX0fmHRwitG0cSDxpg8DHuXoYSdtylb4zJCDYygQIsKpnPE9GYx9hMOS0roQ1RVcYXC5MnT2DmrBpmzqqjtraMccVJjFhCG2CtgBqMCirxGJ74ou/0bd0mAz60uLAaolGMKYvBYkQR46PqEVqhtw/aO1O0tPXS1NzDprYUXb1Kf+BaP936Ua2LRLYH18EtIUUce2j5NoVNJO68CLvxa9fR8YeHsTauZopeZnua5Vahx4S09naiVkFcKX6sGbDERH5umsXjDuLxUhdXxFrFhhZjLGVlCeqnVDB7dj2zZlRQVVmGnzCoBqh19cuDL6xkBtYN1vJO39ZRINHT6h7MzNK4mjsa0CxqEXHD/lwQIQ9rlb5+y+YuS2tLL02bQlo29dK5JU1/WrHqokKJcTU2nvE48ZAqrl8wEH5hJPIi7Keuup7Ohx6lx4YIISZ+ucQl1NwNdhc5wpasEvyYEl1iEZyvScCT4w7if0v2J+ELFRMTNEyrZN99J9PQUEn5xHF4nnWCj96CTsCD2frGbb1kbImPaLCwB4iXR+efKZ26effCNBg8BEgF0LUloKWtl42t3bRs6mNzF/T1Kup5HHdwNTdcNDCYdyTyIuz1v/k9L/z7bfS3baIoej2FWQ1R7oYOfeq7FqHXWJp7OmAXCTu+uEbAAze6vq6O/iNOIphzEDNnNjClvorS0gSqKVLpgDCKhRiqi3nt8sluMh58JYXoIkfvSnFVEZDjbw9/qwcboHgt569nVhq4n/F89rso8u9jJLrpQuyv5Iha3TFL9PUF0Sj+inGFUtSQSgvdvWk6O/poau1h7sxKjj96bmYfI5EXYQN0t7TS/uwqWpcso335crpfeolE2n3cJ8iIPKraiZ9cdy8GnfKYlntU6PViYUcXf2eJrp47pcGXUlxEaBDBFhdTc9CBzPrAh5hx7LGU1dUNWrdAfsmbsLNJd/fQuW49zYuW0LzoCbpeXI/f2x8VCIRQnQULopBmXvTsu8G6g61HvlB1Qus3SlNPZ2Rd8lCDoEQSdiEY1BkdkmJIq6Vkxgxmn3wKs045her99sNkRQstMHaMibCzCdNpOtdvoHXZSpoXLWHz6uexm9rwRQjQKGSuOwQrTiJj4iA4ZdMvZAl75612fPQqSlKFBJawtJTqdx3N3A99iOn/dAzF5XvumMK9lTEXdjZqLT1NzbQ+8xxNf19M+8pn6XvzDfwwjShYjRsAxsAl2QFhxxdGsurmBy6WRpYafHGj2ktmzWTmKScz55TTqJo9G+MN/yXbAmPLLhV2Ln2dm2lfvZaWRYtoXfE0vS+ux/T04IkQqrq2M3UFIjdMFxdyOLKQmZgjI4gzgwJq6PeUjT2bIaqCGhr3gFnX+IevZPbvpty4ExBkwgTqjzmauR86nYajjqJ4wi74OkCBbbJbhZ1N0N/P5ldeo2XZcloWNdK9ag1haxN4PlhXU+uCow8UNaMeFKNzyKOz7DeRxSZ6MIbYNmrQxssKXRaK4CMYlLTxKN93LjNOOZW5p55GxfR9MFHDQoE9gz1G2NmotXQ3t7Bp+Qqanvg7nc+tpue11xmnSoirCrPqrGZG6kMIdBDb5Yo4+xwg+HgYESwhyapq6t99LHNOO42GI48gWVKSu2GBPYQ9Uti59HZ2sun51bQsXkzHsmfpe3E99Pc4n1fFRYAS5yo4mUanFAWMJK5HVxlksbPahCHr2XBd9EHFQ/1iag45mOmnnMys955Ief3kzPoF9lzeFsLOJkyl6Fz/Mi1Ll9La+CSdq57HdmzGFyVU1+Kp2KhmJSr1Rf4wmeq+zYAb4+ecjgHL7QMBSknDVKYdeyKz3/c+Jh90IH4iMeg4CuzZvO2EnY0NQ7rf3EjbyqdpanySTStWYN/aiK/qBi5Z4wKkaug8Z4F+ozR3u05QYlwvOj9qrQtLx1P7rncx57TTmPme91BSUZG7ywJvE97Wws6lt62dtlWr2bR0OW1PLqV7/Xr8VApFXbTVqPDY3N0B4qrpAjFM3HcO0088iTmnnErl7FmFarq9gL1K2NkEvb10rN9A09LltP59MVvWrIGubkJPeLO7Hb98Ig3vfg+zPvABGt51BEWl7muwBfYO9lphZ2PDkM0vv8qm5c/QuW4dZupkGt7zT0zaZ9owtSIF3u68I4Rd4J1HoVWhwF5JQdgF9koKwi6wV5IXYW/LTdecgIF7M2+3c83nseYzr50lL4XHF9a+zD2//hsqHp4nGHGjHkNrmdVQy5kffje//u1fWfH8mySSPp4XjUTGfScmGxHXHhiGcUDFkFOOPZj3nnD4oPV2J11bevjlb//Oy69vJAhCBBMNfxPGFwufPfsUauuqczfbbTx33/28vGgxGo2CtyJ4CKkgzcxTTuXQk0c3QHZbtG9s5n9vvwO/uwP8JDYaH6iqjJtYwT9+/hzKamtyNxuSMB2w6K67aF23DmM8xCrVs+dy1Oc+jYn0MxJ5EXYQBNx21x/5wc8eB6NIYAjjsbxhmnM/9g985LTD+Nq3fsPzr3Sg1rqWwMwLI2rWzsozPigRjw+fOIvv3fCprNTdR0dHF5d/4+c81vgS6rnoSoL7RvyEhPKtyz7EB089cnRdaXcBy+65hyXf+RZJq66/O4qIh49S9b4Pcvw11zJ+0sTczXYIVVj1wEM0fv0qTF8PQUgUGMdgBcYffBin3fJ9KqZsu79NT2cn//2xj6KvvEKgkDCGxIw5fOw3vyQ5blzu6luxbemPAt/3+crnT+Pbl32AIuMRStoN0rQhGMOd9y7m948+w53/+nn+6ZDpmacYtaimUe1HtR+b9YuXoelt99zbRbS3d7Hgmnv4y5KXXeSiyCJZUWrGG/7tm2dR5FmamttyN90tPPUf99B4442YMCRtPQIVVC1oyIxPfYrDzv0srz39dO5mO0x3Wxuh53Hy7XcglZUIlrRCvxqsQtfKFTy44GI63tyYu+nQiJCOBjWnbIg12d2WRyYvwo458/SjueYrp5H0ikCM63GnFvGE//eLRu78+d+4+YYzOObQKQgJ96VcPBe1U0z0vxd1RYp+URCW3U1bexcLrv5P/rbiTTdiHIli0wnV5eO4/Tv/wsaNHVx/y/0ukM1uZundP2PJd76F2ACrPiEBSQ0QPOZ98XwOOOuTPHrZAtrXrM7ddIcRlOULv0Pz86s55bafkJg8laR4kSELsVh6nlnOgxdfQufGptzNB+EazuLr6MKouanRkVdhA5z1kWO44rz34omLZiT4qCTwxPKje5/gx/f8hZtvOJsPnzyXqbXF1FWXUjephNqKEmoqiqkqL6KyLEnFBJ+K8R7jkkpN1e4dM7hpUyeXXHsPjz/9OhBEYeYExDBpQpIf3nAWr76xiesWPgS+i6G3O1l619089b2bMNb1XbSSwkhIKB4HXHAhB5z1Cf5w+WWEL7/KuAlluZvvMGIMHiGNN36Dt1as4KQf/jumrpZiE6IioJYQZcvTy3no4gV0NjXnZjEIkfhTIhFRGWE05MXHHoq7/usxvn3bo6gaNBTEsy6MjsJnzzyKK75yOl1bekml3AMQF2xUXWcla617MESomFhKaUlx7i52CZs2beaCq+5i6XNNzlJHhV31fWrLPH74zX+hqbmNr974O/rUUlNezH13L6B6Nz2MjT+5i+ULb8RYUBFC0vjqfNyDv3ABB539Sf5w4YV0rFxOCLzr2us49Oyzc7PZIXra2rn3I6cTvPUmgTEcff23qZozh4cv+BK0bnLftld18bVFGX/okbz/B/9K+RAFyr6uLu792BmkNmwgVMUToXjWHM789a8pKtlFPvZQnPPJE7j6vJMwGqBeZL2tAIY7713K9354H+VlpVRXlVFTXU5tTTl1tROZXFdBfV0FU+sraZhSxdT6yt0m6paWDi644i6eXNXihqVp5BJ5CaZMSnD7d86ms2sLV3z3f+gNBNW0izedU9Ozq1jyk5/y1MKb8KyiIqj1SKqPIhz8pS9zyLnn8ujll9GxchlpDaOaqzgqa56IPllnwoAl37ye7rZWPnD7HSTqakkgWBJR9FVh88rlPLTgEjo3DmG5xYVD21F2fMtRcM4nT+Tqr5xK0pioCtD9swI/+sUSvn3LrwiCIHezPYKm5nYuuPJnLF21CSVwYy6j1+20mnH8+KZzOeSgOfzmwWX0WlDpRdVDZfe4IY133MmTC28iYQNCPEICfJz7cfCFl3DMxZewceUKmhuXEGTVRo3WZx0VcUhBdeVqkw5Y97vfMvnA+Zz0g3+D+np8sWBCQg1BAzavWMqDl1xKV3NLbm5ZRxcrZ/QGY0yFDfCZs07givNOwoh1X8bFQ6yHMZaf/uopblj4S1KpdO5mu5WNTe1ccNXdLF3TjEoKQgE8rBim15dx23c+RXVlOc8+/wrNbVucq2UTCL6LNrqLq/oaf/wTlt38PYosLjylBBhNoAYOvugijvjsObSu38DG1asISLsCfW4m+WAgeoZro1BLf08KVWXKIYdw8vd/gFdXRyLyn23kem5ZtoSHLrl4kLhFBM/EkQHcAyM531AfiTEXNsA5nzieK84/Bd9EVk8sal3h6+f3r+SbN/9qjxF3c3M7F15zNyvWNCNqXWg2AevBtLoJ/Ph7n+G111t53ydv4aNfvI0Vz7+BRMUUUcVEjTW7isU/vpNl3/+/+DYgxD2DqgYP5fBLLuHAj57Bfeefx70fej8rbr0VPwpgEf9GX88wCuJPfkQoEIaBu4bAtEMO4b0Lv4+pqnPhKwTUOnF3PvUkDyy4eIjaEs0Es4yH8Y2GXSJsgHM/cTxXf+kkPBOgJj5EBfX4+X3PccPCX5JO7163pKm5nYuuuoenVrdmCrNuSJlhelUJP/nup1m7/k0u/fZvaO0O6NcAK67hw4k5KliO/o25Uyz+0R0sv8XVfqgIVoWk9RHgsIsXsO/pp/PIV86nbXEjXjrAs9GnPmIE95GkMSNuqxi4IPsceTgn3rIQM6mKBAZrfCwu7N3m5Ut5eMEldLW2Yjw/quW1Lr4L4HmjNxq7TNgAn/nkiXz78tMp9o0rGKi6empP+cUDz3L9Tb+kry+Vu9kuoaW1gwuv+RlLn29BNIiqKkGMT0NNCbd/99OsWf8Wl9/wW3r6LdDvzPguCh6fS+OP7mDZ9xfiW4uoEKjim4AAy4EXXsy+p3+YRy64gLaVKwmtO5/oMR3IJN8PoA7hBw+xj+lHHcUJC28mPamKpIbRJ/VCsJbOlct44KIF9Pd0M+WEE6Mww67QLsYbdYTc0a21Day1dHX10tnZzebNPWzucr+urt6sXw/d3X2c8c//yNcXfMBZbjGoNUjUxH7vQ89x7Xfv3eXibm7p4MtX3MXSVS2RT+1ngulMrijmh988mxc2vMGVN/6KvjDAWotYD0/9jN8X39C4ynIsafzRHSy95SYSUYSqkBRJPFBh/pcv4NBPnMUjl1xE+3PPEmJdCGNjSGDwohhWMXk9VnWuxWiYdczRnHrzLdiKSfhRY0yIq3na8tSTPHDBlznozDOYefa/ILFQxbk7oyEv9dhr1r7GV66+h76URg2ObucigolbH6OP8ZSVjeP6S/+ZNS+8xTU3/w/W+u61jytwgPKx0w7m+svPoKg4mburvNPS3M4FV/+Mp1Y3O4tjXbxmI0J9ZQm3futsDpy3D48vWkXHlhRiIExbUumQvt5+fn7fk6x/vSMaCW+omVTE7+68iNrasRnh3vjjO1l6y/dc7Yf6IBYPiyXBvM9/luMuv5zullZeb2xEjfN4w1SK/v40by55klcevB+jikqIiOHIa67h8E99Onc3O8SWlk3890f/D8FbbxJi8cRj4ruO5oy77xq249KGRY386ZKL0fZ2QhSxijHuHpQeeAgn3XgTq3/9K168+6dM2H8uH/7v35Ao2rYu8iLspcvXcfZFd5K2Zsh3T/RSd0+bwOTyBN+/4Sw2buzgqoW/pi/lvr8i6gLYKHDGqQdww9fOorho7OJ5NDW3c+GV/8HSNS0IIWotYpxFmz21nJuv/wQH7D8td7NBnH/5nTy6eANqA8BQXVHE7356IXW1k3JX3Wkaf3InyxZ+Fy9yOq0RXPcJy/7nfp53f/Xy6NuMQ7P2z4/xxy99AV9c7BUR4fCrruHIT38md9UdYktzK/d+5HTCpo2RsH0mvusfOOPuu4cVNsBLi5bwx0svhvZNBGoQTWNESBDizzmQk2+5mef+6xdsXLaEj//mf/BHIezh97YdiIBRQax74nJ/XhjihQFekMYPAza293H+FT+ntmYC37vyTIr86GVjPPcQCPzqkee55sZf0NPTn7u7vNDU7Kr0nloT+9RE7zrDjCnl3PqtT21T1KpKf06BdyCf/LL4x3ew7OaFTtQo1ljX+CWWmed8jndffumIoia+2Trw7Uby7YoMqo4beGtvixlHH8XJ/3YrWleLr2msuGNMq0/futX88WuXM+/jH+OAz3yOMBhd7VmehG1QX9CEh/oeNuunvof6CdRPon6S0PhYA519Iedf+QtKS5N889IPUuSHQAIjPoYijCT5/Z/WcdnX/4Ourp7cXe4Ur7zSzBcu/Skr126O3KUEYnzESzClqoRbrj+LfedMyd1saFQQk0BMEuMlsVai7yzmBxuG/PWW7/PMLQsptpaECJ5AsQjgsd+5n+fEyy8bVSwUtZYiY/BFSIhPUgw2yJ+wjeeRTCQoMp7L3xhMJkrtyEw/4gjef+sPSe4znSKBBM4dNAjBmuf5w8ULqNt/v1GHyciLK9LS0sEtP3qAjs7eTCtophClrnAZfyPIM4KX9AiDkN7ugMpy4apLP86S5S9y38PPENhUpjVSEcIgzQdPOoCPn3Fq1h53nDAIufX23/Lk069QVJRwn9PwDJ7vUzbe4zNnvpcD5k3P3WxY7rjrYZas2IDn+aTDNBUTirjuq2dRXp6fcMJr/97Ikh/dxrikcXG6rbO3xveZftzxHPrxj49K1ABvPruKxn+/DYI0YWixohz2mXOY855jclfdIdK9fTz6nZvY/Mqr7q2i0PCPR/Ge876Yu+qwtG54iafv+U+63nqddH8fVi0qhnR/QNm8+Zx62cUUFW+7i0VehL0zpNNpRMygHnEDX8pypFJpioqSo3qtbQtrLWFoo6/YDnyqIx95x5cyH3nFBKkU4nl4njfoumxPK1wusdHZmTxGIl/5Z3eEAwiDAM/3RxWyebcLu0CBsWDb0i9Q4G1IQdgF9koKwi6wV1IQdoG9koKwC+yVFIRdYK+kIOwCeyUFYRfYK/n/PtIXUtEQMUsAAAAASUVORK5CYII= "// no alt attribute here


// Helper to get correct thumbnail URL
const getThumbnailUrl = (thumbnail: string) => {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/${thumbnail}`;
};

// Helper to fetch image as base64
const fetchImageAsBase64 = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function SupervisorInvoiceModal({ open, step, invoice, onClose, onSaved }: SupervisorInvoiceModalProps) {
  const [form, setForm] = useState({
    amount: invoice?.data?.amount?.toString() || step.expected_budget?.toString() || "",
    description: invoice?.data?.description || "",
    files: [] as File[],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update invoice
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/invoices/${invoice.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              amount: form.amount,
              description: form.description,
            },
          }),
        }
      );
      // Upload bills
      for (const file of form.files) {
        const fd = new FormData();
        fd.append("step", step.id);
        fd.append("pdf", file);
        await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`,
          { method: "POST", body: fd }
        );
      }
      onSaved && onSaved();
      onClose();
    } catch (err) {
      alert("Failed to submit invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    let logo = logoBase64; // fallback
    if (step?.thumbnail) {
      try {
        logo = await fetchImageAsBase64(getThumbnailUrl(step.thumbnail));
      } catch (e) {
        // fallback to default logoBase64
      }
    }
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 10, 8, 25, 15);
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Saan Homes", 40, 18);
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("Step Invoice", 10, 32);
    doc.setDrawColor(180, 180, 180);
    doc.line(10, 35, 200, 35);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    let y = 45;
    doc.text(`Step:`, 10, y);
    doc.text(`${step?.title || ""}`, 40, y);
    y += 10;
    doc.text(`Amount:`, 10, y);
    doc.text(`${form.amount}`, 40, y);
    y += 10;
    doc.text(`Description:`, 10, y);
    doc.text(`${form.description}`, 40, y, { maxWidth: 150 });
    y += 30;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by Saan Homes Supervisor Portal", 10, y);
    doc.save(`Invoice_${step?.title || "step"}.pdf`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Step Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              disabled={invoice?.is_approved || saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              required
              disabled={invoice?.is_approved || saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bill (PDF/Image) *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={e => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setForm(f => ({ ...f, files: [...f.files, ...files] }));
                }}
                className="hidden"
                id="invoice-upload"
                required={form.files.length === 0}
                disabled={invoice?.is_approved || saving}
              />
              <label
                htmlFor="invoice-upload"
                className={`inline-block bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-800 ${invoice?.is_approved || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ pointerEvents: invoice?.is_approved || saving ? 'none' : 'auto' }}
              >
                Choose Files
              </label>
            </div>
            {form.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">Selected Files:</h4>
                {form.files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    {!invoice?.is_approved && !saving && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, files: f.files.filter((_, i) => i !== idx) }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={invoice?.is_approved || saving}
            >
              {saving ? "Submitting..." : "Submit Invoice"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Download Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 