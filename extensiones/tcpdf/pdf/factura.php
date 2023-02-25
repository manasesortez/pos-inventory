<?php

require_once "../../../controladores/ventas.controlador.php";
require_once "../../../modelos/ventas.modelo.php";

require_once "../../../controladores/clientes.controlador.php";
require_once "../../../modelos/clientes.modelo.php";

require_once "../../../controladores/usuarios.controlador.php";
require_once "../../../modelos/usuarios.modelo.php";

require_once "../../../controladores/productos.controlador.php";
require_once "../../../modelos/productos.modelo.php";
require('../../fpdf/fpdf.php');

class imprimirFactura{

	public $codigo;

	public function traerImpresionFactura(){

		//TRAEMOS LA INFORMACIÓN DE LA VENTA

		$itemVenta = "codigo";
		$valorVenta = $this->codigo;

		$respuestaVenta = ControladorVentas::ctrMostrarVentas($itemVenta, $valorVenta);

		$fecha = substr($respuestaVenta["fecha"],0,-8);
		$productos = json_decode($respuestaVenta["productos"], true);
		$neto = number_format($respuestaVenta["neto"],2);
		$metodo_pago = json_decode($respuestaVenta["metodo_pago"],2);
		$impuesto = number_format($respuestaVenta["impuesto"],2);
		$total = number_format($respuestaVenta["total"],2);

		//TRAEMOS LA INFORMACIÓN DEL CLIENTE

		$itemCliente = "id";
		$valorCliente = $respuestaVenta["id_cliente"];

		$respuestaCliente = ControladorClientes::ctrMostrarClientes($itemCliente, $valorCliente);

		//TRAEMOS LA INFORMACIÓN DEL VENDEDOR

		$itemVendedor = "id";
		$valorVendedor = $respuestaVenta["id_vendedor"];

		$respuestaVendedor = ControladorUsuarios::ctrMostrarUsuarios($itemVendedor, $valorVendedor);

		//REQUERIMOS LA CLASE FPDF
		//create pdf object
		$pdf = new FPDF('P','mm',array(80,200));

		//add new page
		$pdf->AddPage();

		//set font to arial, bold, 16pt
		$pdf->SetFont('Arial','B',16);
		//Cell(width , height , text , border , end line , [align] )
		$pdf->Cell(60,8,'Farmacia El pueblo',1,1,'C');

		$pdf->SetFont('Arial','B',8);

		$pdf->Cell(60,5,'Direccion: 17 ave. sur 109, col ciudad jardin.',0,1,'C');
		$pdf->Cell(60,5,'Telefono: +503 2661-9345',0,1,'C');
		$pdf->Cell(60,5,'E-mail: Ortz.sv@gmail.com',0,1,'C');
		$pdf->Cell(60,5,'NIT: ',0,1,'C');

		//Line(x1,y1,x2,y2);

		$pdf->Line(7,38,72,38);


		$pdf->Ln(1); // line 


		$pdf->SetFont('Arial','BI',8);
		$pdf->Cell(20,4,'Vendido a:',0,0,'');
		$pdf->SetFont('Courier','BI',8);
		$pdf->Cell(40,4,$respuestaCliente["nombre"],0,1,'');


		$pdf->SetFont('Arial','BI',8);
		$pdf->Cell(20,4,'Cliente No:',0,0,'');
		$pdf->SetFont('Courier','BI',8);
		$pdf->Cell(40,4,$valorVenta,0,1,'');


		$pdf->SetFont('Arial','BI',8);
		$pdf->Cell(20,4,'Vendedor :',0,0,'');
		$pdf->SetFont('Courier','BI',8);
		$pdf->Cell(40,4,$respuestaVendedor["nombre"],0,1,'');

		$pdf->SetFont('Arial','BI',8);
		$pdf->Cell(20,4,'Fecha:',0,0,'');
		$pdf->SetFont('Courier','BI',8);
		$pdf->Cell(40,4,$fecha,0,1,'');

		$pdf->SetX(7);
		$pdf->SetFont('Courier','B',8);

		$pdf->Cell(34,5,'PRODUCTO',1,0,'C');   //70
		$pdf->Cell(8,5,'CANT',1,0,'C');
		$pdf->Cell(12,5,'PRE',1,0,'C');
		$pdf->Cell(12,5,'TOTAL',1,1,'C');

		foreach ($productos as $key => $item) {
			$itemProducto = "descripcion";
			$valorProducto = $item["descripcion"];
			$orden = null;
			
			$respuestaProducto = ControladorProductos::ctrMostrarProductos($itemProducto, $valorProducto, $orden);
			
			$valorUnitario = number_format($respuestaProducto["precio_venta"], 2);
			
			$precioTotal = number_format($item["total"], 2);

			$pdf->SetX(7);
			$pdf->SetFont('Helvetica','B',8);
			$pdf->Cell(34,5,$item["descripcion"],1,0,'L');   
			$pdf->Cell(8,5,$item["cantidad"],1,0,'C');
			$pdf->Cell(12, 5,$valorUnitario,1,0,'C');
			$pdf->Cell(12,5,$precioTotal,1,1,'C'); 
		}

		 

		///////////

		$pdf->SetX(7);
		$pdf->SetFont('courier','B',8);
		$pdf->Cell(20,5,'',0,0,'L');   //190
		//$pdf->Cell(20,5,'',0,0,'C');
		$pdf->Cell(25,5,'SUBTOTAL',1,0,'C');
		$pdf->Cell(20,5,$neto,1,1,'C');


		$pdf->SetX(7);
		$pdf->SetFont('courier','B',8);
		$pdf->Cell(20,5,'',0,0,'L');   //190
		//$pdf->Cell(20,5,'',0,0,'C');
		$pdf->Cell(25,5,'IVA',1,0,'C');
		$pdf->Cell(20,5,$impuesto,1,1,'C');

		$pdf->SetX(7);
		$pdf->SetFont('courier','B',10);
		$pdf->Cell(20,5,'',0,0,'L');   //190
		//$pdf->Cell(20,5,'',0,0,'C');
		$pdf->Cell(25,5,'GRAN TOTAL',1,0,'C');
		$pdf->Cell(20,5,$total,1,1,'C');

		

		$pdf->Cell(20,5,'',0,1,'');
		$pdf->SetX(7);
		$pdf->SetFont('Courier','B',8);
		$pdf->Cell(25,5,'Importante :',0,1,'');

		$pdf->SetX(7);
		$pdf->SetFont('Arial','',5);
		$pdf->Cell(75,5,'Ningun articulo sera reemplazado o reembolsado si no tiene la factura con usted.',0,2,'');

		$pdf->SetX(7);
		$pdf->SetFont('Arial','',5);
		$pdf->Cell(75,5,'Puede reembolsar dentro de los 2 dias posteriores a la compra. ',0,1,'');


		// ---------------------------------------------------------
		//SALIDA DEL ARCHIVO 

		$pdf->Output('factura.pdf', 'D');




	}

}

$factura = new imprimirFactura();
$factura -> codigo = $_GET["codigo"];
$factura -> traerImpresionFactura();

?>