# jeu-petits-chevaux

## Turn decision

```mermaid
graph TB
AA{"Turn started"}
A("Dice launched")

B("Do I own outside pawn? (6 version)")
C("Do I own outside pawn? (1-5 version)")

D("Does my root case is blocked by my pawn?")
E("Put a pawn outside")
J("Do I own a movable pawn")
I("Do I own a movable pawn")

K["Does my root case is blocked by my pawn?"]
X["Move a pawn or put a pawn outside"]
Y["Move a pawn"]

F{"Launch dice again and play another turn"}
Z{"Turn End"}


AA==> A
A==> |I made a 6| B
A--> |I made between 1 and 5| C

B--> |No| D
B==> |Yes| I

D==> |Yes| F
D--> |No| E

E--> F
I==> |Yes| K
K==> |Yes| Y

K--> |No| X
X--> F
C--> |No| Z
C==> |Yes| J
J==> |Yes| Y
J--> |No| Z
Y--> Z
```

## Board coordinates

![Board](.github/assets/board.png "Board")


## TODO

- Il faut que quand je move un pion, l'ancien soit retiré de l'interface
- Une fois que c'est fait et qu'on peut jouer, il faut que les coups soit autorisé
(mettre du text sur l'ui sur ce qui est possible de faire dans un premier temps)