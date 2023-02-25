$('.tablaVentas').DataTable( {
    "ajax": "ajax/datatable-ventas.ajax.php",
    "deferRender": true,
	"retrieve": true,
	"processing": true,
	 "language": {

			"sProcessing":     "Procesando...",
			"sLengthMenu":     "Mostrar _MENU_ registros",
			"sZeroRecords":    "No se encontraron resultados",
			"sEmptyTable":     "Ningún dato disponible en esta tabla",
			"sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_",
			"sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0",
			"sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
			"sInfoPostFix":    "",
			"sSearch":         "Buscar:",
			"sUrl":            "",
			"sInfoThousands":  ",",
			"sLoadingRecords": "Cargando...",
			"oPaginate": {
			"sFirst":    "Primero",
			"sLast":     "Último",
			"sNext":     "Siguiente",
			"sPrevious": "Anterior"
			},
			"oAria": {
				"sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
				"sSortDescending": ": Activar para ordenar la columna de manera descendente"
			}

	}

});

$(".tablaVentas tbody").on("click", "button.agregarProducto", function(){

	var idProducto = $(this).attr("idProducto");
	$(this).removeClass("btn-primary agregarProducto");
	$(this).addClass("btn-default");

	var datos = new FormData();
    datos.append("idProducto", idProducto);
     $.ajax({

     	url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){

      	    var descripcion = respuesta["descripcion"];
          	var stock = respuesta["stock"];
          	var precio = respuesta["precio_venta"];

          	if(stock == 0){
      			swal({
			      title: "No hay stock disponible",
			      type: "error",
			      confirmButtonText: "¡Cerrar!"
			    });
			    $("button[idProducto='"+idProducto+"']").addClass("btn-primary agregarProducto");
			    return;
          	}

          	$(".nuevoProducto").append(
          	'<div class="row" style="padding:5px 15px">'+
			  '<!-- Descripción del producto -->'+
	          '<div class="col-xs-6" style="padding-right:0px">'+
	            '<div class="input-group">'+
	              
	              '<span class="input-group-addon"><button type="button" class="btn btn-danger btn-xs quitarProducto" idProducto="'+idProducto+'"><i class="fa fa-times"></i></button></span>'+

	              '<input type="text" class="form-control nuevaDescripcionProducto" idProducto="'+idProducto+'" name="agregarProducto" value="'+descripcion+'" readonly required>'+

	            '</div>'+

	          '</div>'+

	          '<!-- Cantidad del producto -->'+

	          '<div class="col-xs-3">'+
	            
	             '<input type="number" class="form-control nuevaCantidadProducto" name="nuevaCantidadProducto" min="1" value="1" stock="'+stock+'" nuevoStock="'+Number(stock-1)+'" required>'+

	          '</div>' +

	          '<!-- Precio del producto -->'+

	          '<div class="col-xs-3 ingresoPrecio" style="padding-left:0px">'+

	            '<div class="input-group">'+

	              '<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+
	                 
	              '<input type="text" class="form-control nuevoPrecioProducto" precioReal="'+precio+'" name="nuevoPrecioProducto" value="'+precio+'" readonly required>'+
	 
	            '</div>'+
	             
	          '</div>'+

	        '</div>') 

	        // SUMAR TOTAL DE PRECIOS

	        sumarTotalPrecios()

	        // AGREGAR IMPUESTO

	        agregarImpuesto()

	        // AGRUPAR PRODUCTOS EN FORMATO JSON

	        listarProductos()

	        // PONER FORMATO AL PRECIO DE LOS PRODUCTOS

	        $(".nuevoPrecioProducto").number(true, 2);


			localStorage.removeItem("quitarProducto");

      	}

     })

});

$(".tablaVentas").on("draw.dt", function(){
	if(localStorage.getItem("quitarProducto") != null){
		var listaIdProductos = JSON.parse(localStorage.getItem("quitarProducto"));
		for(var i = 0; i < listaIdProductos.length; i++){
			$("button.recuperarBoton[idProducto='"+listaIdProductos[i]["idProducto"]+"']").removeClass('btn-default');
			$("button.recuperarBoton[idProducto='"+listaIdProductos[i]["idProducto"]+"']").addClass('btn-primary agregarProducto');
		}
	}
})

var idQuitarProducto = [];
localStorage.removeItem("quitarProducto");

$(".formularioVenta").on("click", "button.quitarProducto", function(){
	$(this).parent().parent().parent().parent().remove();
	var idProducto = $(this).attr("idProducto");
	if(localStorage.getItem("quitarProducto") == null){
		idQuitarProducto = [];
	}else{
		idQuitarProducto.concat(localStorage.getItem("quitarProducto"))
	}

	idQuitarProducto.push({"idProducto":idProducto});
	localStorage.setItem("quitarProducto", JSON.stringify(idQuitarProducto));

	$("button.recuperarBoton[idProducto='"+idProducto+"']").removeClass('btn-default');
	$("button.recuperarBoton[idProducto='"+idProducto+"']").addClass('btn-primary agregarProducto');

	if($(".nuevoProducto").children().length == 0){
		$("#nuevoImpuestoVenta").val(0);
		$("#nuevoTotalVenta").val(0);
		$("#totalVenta").val(0);
		$("#nuevoTotalVenta").attr("total",0);
	}else{
    	sumarTotalPrecios() 
        agregarImpuesto()
        listarProductos()
	}

})

var numProducto = 0;
$(".btnAgregarProducto").click(function(){
	numProducto ++;
	var datos = new FormData();
	datos.append("traerProductos", "ok");
	$.ajax({
		url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){
      	    $(".nuevoProducto").append(

          	'<div class="row" style="padding:5px 15px">'+	          
	          '<div class="col-xs-6" style="padding-right:0px">'+
	            '<div class="input-group">'+
	              '<span class="input-group-addon"><button type="button" class="btn btn-danger btn-xs quitarProducto" idProducto><i class="fa fa-times"></i></button></span>'+
	              '<select class="form-control nuevaDescripcionProducto" id="producto'+numProducto+'" idProducto name="nuevaDescripcionProducto" required>'+
	              '<option>Seleccione el producto</option>'+
	              '</select>'+  
	            '</div>'+
	          '</div>'+

	          '<div class="col-xs-3 ingresoCantidad">'+
	             '<input type="number" class="form-control nuevaCantidadProducto" name="nuevaCantidadProducto" min="1" value="0" stock nuevoStock required>'+
	          '</div>' +

	          '<div class="col-xs-3 ingresoPrecio" style="padding-left:0px">'+
	            '<div class="input-group">'+
	              '<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+ 
	              '<input type="text" class="form-control nuevoPrecioProducto" precioReal="" name="nuevoPrecioProducto" readonly required>'+
	            '</div>'+
	          '</div>'+
	        '</div>');

	         respuesta.forEach(funcionForEach);

	         function funcionForEach(item, index){

	         	if(item.stock != 0){

		         	$("#producto"+numProducto).append(

						'<option idProducto="'+item.id+'" value="'+item.descripcion+'">'+item.descripcion+'</option>'
		         	)
		         }
	         }

    		sumarTotalPrecios()

	        agregarImpuesto()

	        $(".nuevoPrecioProducto").number(true, 2);
      	}
	})
})

$(".formularioVenta").on("change", "select.nuevaDescripcionProducto", function(){
	var nombreProducto = $(this).val();
	var nuevaDescripcionProducto = $(this).parent().parent().parent().children().children().children(".nuevaDescripcionProducto");
	var nuevoPrecioProducto = $(this).parent().parent().parent().children(".ingresoPrecio").children().children(".nuevoPrecioProducto");
	var nuevaCantidadProducto = $(this).parent().parent().parent().children(".ingresoCantidad").children(".nuevaCantidadProducto");

	var datos = new FormData();
    datos.append("nombreProducto", nombreProducto);
	  $.ajax({

     	url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){
      	    
      	     $(nuevaDescripcionProducto).attr("idProducto", respuesta["id"]);
      	    $(nuevaCantidadProducto).attr("stock", respuesta["stock"]);
      	    $(nuevaCantidadProducto).attr("nuevoStock", Number(respuesta["stock"])-1);
      	    $(nuevoPrecioProducto).val(respuesta["precio_venta"]);
      	    $(nuevoPrecioProducto).attr("precioReal", respuesta["precio_venta"]);

	        listarProductos()
      	}

      })
})

$(".formularioVenta").on("change", "input.nuevaCantidadProducto", function(){
	var precio = $(this).parent().parent().children(".ingresoPrecio").children().children(".nuevoPrecioProducto");
	var precioFinal = $(this).val() * precio.attr("precioReal");
	precio.val(precioFinal);
	var nuevoStock = Number($(this).attr("stock")) - $(this).val();
	
	$(this).attr("nuevoStock", nuevoStock);
	if(Number($(this).val()) > Number($(this).attr("stock"))){
		$(this).val(0);
		$(this).attr("nuevoStock", $(this).attr("stock"));

		var precioFinal = $(this).val() * precio.attr("precioReal");
		precio.val(precioFinal);
		sumarTotalPrecios();

		swal({
	      title: "La cantidad supera el Stock",
	      text: "¡Sólo hay "+$(this).attr("stock")+" unidades!",
	      type: "error",
	      confirmButtonText: "¡Cerrar!"
	    });

	    return;

	}
	sumarTotalPrecios()
   
    agregarImpuesto()

    listarProductos()

})

function sumarTotalPrecios(){
	var precioItem = $(".nuevoPrecioProducto");
	var arraySumaPrecio = [];  

	for(var i = 0; i < precioItem.length; i++){
		arraySumaPrecio.push(Number($(precioItem[i]).val()));	 
	}

	function sumaArrayPrecios(total, numero){
		return total + numero;
	}

	var sumaTotalPrecio = arraySumaPrecio.reduce(sumaArrayPrecios);
	$("#nuevoTotalVenta").val(sumaTotalPrecio);
	$("#totalVenta").val(sumaTotalPrecio);
	$("#nuevoTotalVenta").attr("total",sumaTotalPrecio);

}

function agregarImpuesto(){
	var impuesto = $("#nuevoImpuestoVenta").val();
	var precioTotal = $("#nuevoTotalVenta").attr("total");
	var precioImpuesto = Number(precioTotal * impuesto/100);
	var totalConImpuesto = Number(precioImpuesto) + Number(precioTotal);
	
	$("#nuevoTotalVenta").val(totalConImpuesto);
	$("#totalVenta").val(totalConImpuesto);
	$("#nuevoPrecioImpuesto").val(precioImpuesto);
	$("#nuevoPrecioNeto").val(precioTotal);

}

$("#nuevoImpuestoVenta").change(function(){

	agregarImpuesto();

});

$("#nuevoTotalVenta").number(true, 2);
$("#nuevoMetodoPago").change(function(){
	var metodo = $(this).val();
	if(metodo == "Efectivo"){
		$(this).parent().parent().removeClass("col-xs-6");
		$(this).parent().parent().addClass("col-xs-4");
		$(this).parent().parent().parent().children(".cajasMetodoPago").html(

			 '<div class="col-xs-4">'+ 
			 	'<div class="input-group">'+ 
			 		'<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+ 
			 		'<input type="text" class="form-control" id="nuevoValorEfectivo" placeholder="000000" required>'+
			 	'</div>'+
			 '</div>'+

			 '<div class="col-xs-4" id="capturarCambioEfectivo" style="padding-left:0px">'+
			 	'<div class="input-group">'+
			 		'<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+
			 		'<input type="text" class="form-control" id="nuevoCambioEfectivo" placeholder="000000" readonly required>'+
			 	'</div>'+
			 '</div>'

		 )

		$('#nuevoValorEfectivo').number( true, 2);
      	$('#nuevoCambioEfectivo').number( true, 2);
      	listarMetodos()
	}else{
		$(this).parent().parent().removeClass('col-xs-4');
		$(this).parent().parent().addClass('col-xs-6');
		$(this).parent().parent().parent().children('.cajasMetodoPago').html(
		 	'<div class="col-xs-6" style="padding-left:0px">'+       
                '<div class="input-group">'+    
                  '<input type="number" min="0" class="form-control" id="nuevoCodigoTransaccion" placeholder="Código transacción"  required>'+      
                  '<span class="input-group-addon"><i class="fa fa-lock"></i></span>'+
                '</div>'+
              '</div>')
	}

	

})

$(".formularioVenta").on("change", "input#nuevoValorEfectivo", function(){
	var efectivo = $(this).val();
	var cambio =  Number(efectivo) - Number($('#nuevoTotalVenta').val());
	var nuevoCambioEfectivo = $(this).parent().parent().parent().children('#capturarCambioEfectivo').children().children('#nuevoCambioEfectivo');
	nuevoCambioEfectivo.val(cambio);

})

$(".formularioVenta").on("change", "input#nuevoCodigoTransaccion", function(){
     listarMetodos()
})

function listarProductos(){
	var listaProductos = [];

	var descripcion = $(".nuevaDescripcionProducto");
	var cantidad = $(".nuevaCantidadProducto");
	var precio = $(".nuevoPrecioProducto");

	for(var i = 0; i < descripcion.length; i++){
		listaProductos.push({ "id" : $(descripcion[i]).attr("idProducto"), 
							  "descripcion" : $(descripcion[i]).val(),
							  "cantidad" : $(cantidad[i]).val(),
							  "stock" : $(cantidad[i]).attr("nuevoStock"),
							  "precio" : $(precio[i]).attr("precioReal"),
							  "total" : $(precio[i]).val()})

	}

	$("#listaProductos").val(JSON.stringify(listaProductos)); 

}

function listarMetodos(){
	var listaMetodos = "";

	if($("#nuevoMetodoPago").val() == "Efectivo"){
		$("#listaMetodoPago").val("Efectivo");
	}else{
		$("#listaMetodoPago").val($("#nuevoMetodoPago").val()+"-"+$("#nuevoCodigoTransaccion").val());
	}

}

$(".tablas").on("click", ".btnEditarVenta", function(){
	var idVenta = $(this).attr("idVenta");
	window.location = "index.php?ruta=editar-venta&idVenta="+idVenta;
})

function quitarAgregarProducto(){
	var idProductos = $(".quitarProducto");
	var botonesTabla = $(".tablaVentas tbody button.agregarProducto");
	for(var i = 0; i < idProductos.length; i++){
		var boton = $(idProductos[i]).attr("idProducto");
		for(var j = 0; j < botonesTabla.length; j ++){
			if($(botonesTabla[j]).attr("idProducto") == boton){
				$(botonesTabla[j]).removeClass("btn-primary agregarProducto");
				$(botonesTabla[j]).addClass("btn-default");
			}
		}

	}
	
}

$('.tablaVentas').on( 'draw.dt', function(){
	quitarAgregarProducto();
})


$(".tablas").on("click", ".btnEliminarVenta", function(){
  var idVenta = $(this).attr("idVenta");
  swal({
        title: '¿Está seguro de borrar la venta?',
        text: "¡Si no lo está puede cancelar la accíón!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar venta!'
      }).then(function(result){
        if (result.value) {
            window.location = "index.php?ruta=ventas&idVenta="+idVenta;
        }
  })

})

$(".tablas").on("click", ".btnImprimirFactura", function(){

	var codigoVenta = $(this).attr("codigoVenta");

	window.open("extensiones/tcpdf/pdf/factura.php?codigo="+codigoVenta, "_blank");

})

$('#daterange-btn').daterangepicker(
  {
    ranges   : {
      'Hoy'       : [moment(), moment()],
      'Ayer'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Últimos 7 días' : [moment().subtract(6, 'days'), moment()],
      'Últimos 30 días': [moment().subtract(29, 'days'), moment()],
      'Este mes'  : [moment().startOf('month'), moment().endOf('month')],
      'Último mes'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    startDate: moment(),
    endDate  : moment()
  },
  function (start, end) {
    $('#daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    var fechaInicial = start.format('YYYY-MM-DD');
    var fechaFinal = end.format('YYYY-MM-DD');
    var capturarRango = $("#daterange-btn span").html();
   	localStorage.setItem("capturarRango", capturarRango);
   	window.location = "index.php?ruta=ventas&fechaInicial="+fechaInicial+"&fechaFinal="+fechaFinal;
  }

)

$(".daterangepicker.opensleft .range_inputs .cancelBtn").on("click", function(){

	localStorage.removeItem("capturarRango");
	localStorage.clear();
	window.location = "ventas";
})

$(".daterangepicker.opensleft .ranges li").on("click", function(){

	var textoHoy = $(this).attr("data-range-key");

	if(textoHoy == "Hoy"){

		var d = new Date();
		
		var dia = d.getDate();
		var mes = d.getMonth()+1;
		var año = d.getFullYear();

		if(mes < 10){

			var fechaInicial = año+"-0"+mes+"-"+dia;
			var fechaFinal = año+"-0"+mes+"-"+dia;

		}else if(dia < 10){

			var fechaInicial = año+"-"+mes+"-0"+dia;
			var fechaFinal = año+"-"+mes+"-0"+dia;

		}else if(mes < 10 && dia < 10){

			var fechaInicial = año+"-0"+mes+"-0"+dia;
			var fechaFinal = año+"-0"+mes+"-0"+dia;

		}else{

			var fechaInicial = año+"-"+mes+"-"+dia;
	    	var fechaFinal = año+"-"+mes+"-"+dia;

		}	

    	localStorage.setItem("capturarRango", "Hoy");

    	window.location = "index.php?ruta=ventas&fechaInicial="+fechaInicial+"&fechaFinal="+fechaFinal;

	}

})




